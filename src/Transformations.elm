module Transformations exposing (..)

import Rule
import Term exposing (Term, MetaVar)
import Transformation exposing (Transformation)


type Direction
    = Leftwards
    | Rightwards


type alias Dictionary =
    List ( MetaVar, List Term )


type alias Rule =
    { name : String
    , isSymmetric : Bool
    , antecedents : List Term
    , left : Term
    , right : Term
    , index : Int
    }



-- Let's try creating a dictionary of metavariables. Then we unify, failing if
-- two different terms have the same metavariable. Then we add the scratch for
-- any empty metavariables. Then we attempt to satisfy the antecedents for any
-- combination entries. We need to return Single or Multiple, but we don't need
-- to return the matches.


transformations : List Rule.Rule -> List Term -> List Term -> Term -> List Transformation
transformations rules scratch context focus =
    rules
        |> List.indexedMap toRule
        -- Add a leftwards and rightwards version of each rule.
        |> List.foldr addDirection []
        -- Add metavariables to the dictionary
        |> List.map addDictionary
        -- -- Performs unification on the pattern
        |> List.filterMap (performUnification focus)
        -- Add metavariable bindings for any matching antecedents and scratch in the context.
        |> List.filterMap (antecedents focus scratch (Term.Atom Term.Top :: context))
        -- -- Add every item in the scratch list as a possible match for a metavariable.
        -- |> List.map (addScratch scratch)
        -- Removes any theorems which have no options for some metavariable.
        |> List.filter isPossible
        -- Convert to a transformation
        |> List.map toTransformation


toRule : Int -> Rule.Rule -> Rule
toRule idx rule =
    { name = rule.name
    , isSymmetric = rule.isSymmetric
    , antecedents = rule.antecedents
    , left = rule.left
    , right = rule.right
    , index = idx
    }


fromRule : Rule -> Rule.Rule
fromRule rule =
    { name = rule.name
    , isSymmetric = rule.isSymmetric
    , antecedents = rule.antecedents
    , left = rule.left
    , right = rule.right
    }


addDirection : Rule -> List { rule : Rule, direction : Direction } -> List { rule : Rule, direction : Direction }
addDirection rule xs =
    if rule.isSymmetric then
        { rule = rule, direction = Rightwards } :: xs
    else
        { rule = rule, direction = Rightwards } :: { rule = rule, direction = Leftwards } :: xs


addDictionary : { rule : Rule, direction : Direction } -> { rule : Rule, direction : Direction, dictionary : Dictionary }
addDictionary x =
    let
        dictionary =
            List.foldl Term.addMetavariables [] (x.rule.left :: x.rule.right :: x.rule.antecedents)
    in
        { rule = x.rule
        , direction = x.direction
        , dictionary = dictionary
        }


performUnification :
    Term
    -> { rule : Rule, direction : Direction, dictionary : Dictionary }
    -> Maybe { rule : Rule, direction : Direction, dictionary : Dictionary }
performUnification focus x =
    unify focus (origin x) x.dictionary |> Maybe.map (\d -> { x | dictionary = d })


unify : Term -> Term -> Dictionary -> Maybe Dictionary
unify focus term dict =
    case ( focus, term ) of
        ( Term.Atom (Term.MetaVar _), _ ) ->
            Just dict

        ( t1, Term.Atom (Term.MetaVar Term.MetaA) ) ->
            dictionaryAddUnique Term.MetaA t1 dict

        ( t1, Term.Atom (Term.MetaVar Term.MetaB) ) ->
            dictionaryAddUnique Term.MetaB t1 dict

        ( t1, Term.Atom (Term.MetaVar Term.MetaC) ) ->
            dictionaryAddUnique Term.MetaC t1 dict

        ( Term.Atom a1, Term.Atom a2 ) ->
            if a1 == a2 then
                Just dict
            else
                Nothing

        ( Term.Unary u1 t1, Term.Unary u2 t2 ) ->
            if u1 == u2 then
                unify t1 t2 dict
            else
                Nothing

        ( Term.Binary b1 t11 t12, Term.Binary b2 t21 t22 ) ->
            if b1 == b2 then
                dict |> unify t11 t21 |> Maybe.andThen (unify t12 t22)
            else
                Nothing

        ( _, _ ) ->
            Nothing


everyScratch : (Dictionary -> Bool) -> List Term -> Dictionary -> Maybe Dictionary -> Maybe Dictionary
everyScratch p scratch dict =
    let
        f dict1 dict2 result =
            case dict1 of
                [] ->
                    if p dict2 then
                        case result of
                            Nothing ->
                                Just dict2

                            Just fullDict ->
                                Just (dictionaryMerge fullDict dict2)
                    else
                        result

                ( v, [] ) :: dict1r ->
                    List.foldr (\t -> f dict1r (( v, [ t ] ) :: dict2)) result scratch

                ( v, xs ) :: dict1r ->
                    f dict1r (( v, xs ) :: dict2) result
    in
        f (List.reverse dict) []


antecedents :
    Term
    -> List Term
    -> List Term
    -> { rule : Rule, direction : Direction, dictionary : Dictionary }
    -> Maybe { rule : Rule, direction : Direction, dictionary : Dictionary }
antecedents focus scratch context x =
    let
        f antecedents dict term result =
            case antecedents of
                [] ->
                    everyScratch
                        (\dict -> focus /= substitute dict (target x))
                        scratch
                        dict
                        result

                ant :: ants ->
                    case unify term ant dict of
                        Nothing ->
                            result

                        Just newDict ->
                            List.foldl (f ants newDict) result context

        result =
            List.foldl (f x.rule.antecedents x.dictionary) Nothing context
    in
        Maybe.map (\d -> { x | dictionary = d }) result



-- Checks if the focus matches the target. We don't want transformations whose
-- target is the same as the focus.


checkDictionary : Term -> List Term -> Term -> Dictionary -> Bool
checkDictionary focus scratch target dict =
    if dictionaryHasEmpty dict then
        case scratch of
            [] ->
                False

            [ _ ] ->
                focus /= substitute (dictionaryAddScratch scratch dict) target

            _ ->
                True
    else
        focus /= substitute dict target


addScratch : List Term -> { rule : Rule, direction : Direction, dictionary : Dictionary } -> { rule : Rule, direction : Direction, dictionary : Dictionary }
addScratch scratch x =
    let
        f ( v, xs ) =
            if List.isEmpty xs then
                ( v, scratch )
            else
                ( v, xs )
    in
        { x | dictionary = List.map f x.dictionary }


isPossible : { rule : Rule, direction : Direction, dictionary : Dictionary } -> Bool
isPossible x =
    List.all (\( v, xs ) -> not (List.isEmpty xs)) x.dictionary


toTransformation : { rule : Rule, direction : Direction, dictionary : Dictionary } -> Transformation
toTransformation x =
    { isMultiple = List.any (\( v, ts ) -> not (isSingleton ts)) x.dictionary
    , display = substitute x.dictionary (target x)
    , isReversed = x.direction == Leftwards
    , ruleIndex = x.rule.index
    }


origin : { a | rule : Rule, direction : Direction } -> Term
origin x =
    case x.direction of
        Leftwards ->
            x.rule.right

        Rightwards ->
            x.rule.left


target : { a | rule : Rule, direction : Direction } -> Term
target x =
    case x.direction of
        Leftwards ->
            x.rule.left

        Rightwards ->
            x.rule.right


dictionaryAddUnique : MetaVar -> Term -> Dictionary -> Maybe Dictionary
dictionaryAddUnique v1 t1 dict =
    case dict of
        [] ->
            Debug.crash "impossible"

        ( v2, [] ) :: dict2 ->
            if v1 == v2 then
                Just (( v2, [ t1 ] ) :: dict2)
            else
                dictionaryAddUnique v1 t1 dict2 |> Maybe.map (\d -> ( v2, [] ) :: d)

        ( v2, [ t2 ] ) :: dict2 ->
            if v1 == v2 then
                if t1 == t2 then
                    Just (( v2, [ t2 ] ) :: dict2)
                else
                    Nothing
            else
                dictionaryAddUnique v1 t1 dict2 |> Maybe.map (\d -> ( v2, [ t2 ] ) :: d)

        ( v2, _ ) :: dict2 ->
            Debug.crash "impossible"


dictionaryMerge : Dictionary -> Dictionary -> Dictionary
dictionaryMerge d1 d2 =
    let
        f ( v, ts1 ) ( _, ts2 ) =
            ( v, uniq ts1 ts2 )
    in
        List.map2 f d1 d2


uniq : List Term -> List Term -> List Term
uniq ts1 ts2 =
    case ( ts1, ts2 ) of
        ( [], ts2 ) ->
            ts2

        ( [ t1 ], [] ) ->
            [ t1 ]

        ( [ t1 ], t2 :: ts2 ) ->
            if t1 == t2 then
                t2 :: ts2
            else
                t2 :: uniq [ t1 ] ts2

        ( t1 :: ts1, ts2 ) ->
            uniq ts1 (uniq [ t1 ] ts2)


isSingleton : List a -> Bool
isSingleton xs =
    case xs of
        [ _ ] ->
            True

        _ ->
            False


substitute : Dictionary -> Term -> Term
substitute dict term =
    case term of
        Term.Atom (Term.MetaVar m) ->
            lookup m dict

        Term.Atom a ->
            Term.Atom a

        Term.Unary u t1 ->
            Term.Unary u (substitute dict t1)

        Term.Binary b t1 t2 ->
            Term.Binary b (substitute dict t1) (substitute dict t2)


dictionaryHasEmpty : Dictionary -> Bool
dictionaryHasEmpty =
    List.any (\( v, xs ) -> List.isEmpty xs)


dictionaryAddScratch : List Term -> Dictionary -> Dictionary
dictionaryAddScratch scratch =
    let
        f ( v, xs ) =
            if List.isEmpty xs then
                ( v, scratch )
            else
                ( v, xs )
    in
        List.map f


lookup : MetaVar -> Dictionary -> Term
lookup m1 dict =
    case dict of
        [] ->
            Debug.crash "impossible"

        ( m2, [ t ] ) :: dict_ ->
            if m1 == m2 then
                t
            else
                lookup m1 dict_

        ( m2, _ ) :: dict_ ->
            if m1 == m2 then
                Term.Atom (Term.MetaVar m1)
            else
                lookup m1 dict_


restrict : Rule.Rule -> Transformation -> List Term -> Dictionary -> Dictionary
restrict rule sub context dict =
    let
        recur attempt dict result =
            case dict of
                [] ->
                    if
                        List.all
                            (\ant ->
                                let
                                    t1 =
                                        substitute attempt ant
                                in
                                    List.any (\t2 -> t1 == t2) context
                            )
                            rule.antecedents
                    then
                        dictionaryMerge attempt result
                    else
                        result

                ( mvar, terms ) :: dictRest ->
                    List.foldl (\term -> recur (( mvar, [ term ] ) :: attempt) dictRest) result terms
    in
        recur [] dict (clearDictionary dict)


clearDictionary : Dictionary -> Dictionary
clearDictionary =
    List.map (\( mvar, _ ) -> ( mvar, [] ))


{-| Runs through every combination in the context, adding the combination to the
dictionary if it satisfies the antecedents and if it is not the same as the focus.
-}
reallyAntecedents :
    Term
    -> Term
    -> List Term
    -> List Term
    -> List Term
    -> Dictionary
    -> Dictionary
reallyAntecedents focus right scratch context antecedents dict =
    let
        f antecedents dict term result =
            case antecedents of
                [] ->
                    everyScratch2 (\dict -> focus /= substitute dict right) scratch dict result

                ant :: ants ->
                    case unify term ant dict of
                        Nothing ->
                            result

                        Just newDict ->
                            List.foldr (f ants newDict) result context
    in
        List.foldr (f antecedents dict) dict context


everyScratch2 : (Dictionary -> Bool) -> List Term -> Dictionary -> Dictionary -> Dictionary
everyScratch2 p scratch dict =
    let
        f dict1 dict2 result =
            case dict1 of
                [] ->
                    if p dict2 then
                        dictionaryMerge result dict2
                    else
                        result

                ( v, [] ) :: dict1r ->
                    List.foldr (\t -> f dict1r (( v, [ t ] ) :: dict2)) result scratch

                ( v, xs ) :: dict1r ->
                    f dict1r (( v, xs ) :: dict2) result
    in
        f (List.reverse dict) []
