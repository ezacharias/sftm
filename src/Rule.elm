module Rule exposing (..)

import Term exposing (..)


type alias Rule =
    { name : String
    , isSymmetric : Bool
    , antecedents : List Term
    , left : Term
    , right : Term
    }


reverse : Rule -> Rule
reverse rule =
    { rule | left = rule.right, right = rule.left }


reverseIf : Bool -> Rule -> Rule
reverseIf b rule =
    if b then reverse rule else rule
