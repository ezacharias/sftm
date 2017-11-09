module Dialog.Scratch exposing (..)

import Html exposing (Html, div, span, text, button, ul, li)
import Html.Attributes exposing (id, class, disabled)
import Html.Events exposing (onClick)
import Term exposing (..)
import Graphics
import Symbol exposing (Symbol)
import Utilities exposing (unsafeGet, castHtml, scrollToTopCmd)
import Render
import Svg
import Svg.Attributes as SA
import Task
import Dom.Scroll


type alias Model =
    { selection : Selection
    , left : Maybe Int
    , symbol : Maybe Int
    , right : Maybe Int
    , symbols : List Symbol
    , scratch : List Term
    , focus : Term
    }


type Selection
    = LeftSelection
    | SymbolSelection
    | RightSelection


type Msg
    = IgnoreMsg
    | ListItemClickedMsg Int
    | OkClickedMsg
    | CancelClickedMsg
    | SelectionClickedMsg Selection


type Out
    = NoChangeOut
    | ChangedOut Model
    | ChangedCmdOut Model (Cmd Msg)
    | ExitOut
    | AddOut Term


init : List Symbol -> List Term -> Term -> Model
init symbols scratch focus =
    { selection = SymbolSelection
    , left = Nothing
    , symbol = Nothing
    , right = Nothing
    , symbols = symbols
    , scratch = scratch
    , focus = focus
    }


view : Model -> Html Msg
view model =
    let
        left =
            Maybe.map (\i -> unsafeGet i model.scratch) model.left

        symbol =
            Maybe.map (\i -> unsafeGet i model.symbols) model.symbol

        right =
            Maybe.map (\i -> unsafeGet i model.scratch) model.right
    in
        div [ class "content-body" ]
            [ div [ class "nav-bar" ]
                [ div [] []
                , div [ class "top-title" ] [ text "Scratch Pad Add" ]
                , div [] []
                ]
            , div [ class "main-formula" ]
                [ Render.formulaHtml0 (formula model.focus left symbol right) ]
            , div [ class "dialog-control" ]
                [ button [ class "basic", onClick CancelClickedMsg ] [ text "Cancel" ]
                , div [ Html.Attributes.style [ ( "width", "8px" ) ] ] []
                , button [ class "basic", disabled (not (isValid left symbol right)), onClick OkClickedMsg ] [ text "OK" ]
                ]
            , div [ class "dialog-command" ]
                [ leftButtonView model
                , symbolButtonView model
                , rightButtonView model
                ]
            , div [ id "scrolling", class "panel-body" ]
                [ listView model ]
            ]


listView : Model -> Html Msg
listView model =
    case model.selection of
        LeftSelection ->
            scratchListView model.left model.scratch

        SymbolSelection ->
            symbolListView model.symbol model.symbols

        RightSelection ->
            scratchListView model.right model.scratch


isHidden : Model -> Bool
isHidden model =
    case Maybe.map (\i -> unsafeGet i model.symbols) model.symbol of
        Nothing ->
            True

        Just sym ->
            case sym of
                Symbol.Conjunction ->
                    False

                Symbol.Disjunction ->
                    False

                Symbol.Equivalence ->
                    False

                Symbol.Implication ->
                    False

                _ ->
                    True


selectedClass : Bool -> String
selectedClass b =
    if b then
        " selected"
    else
        ""


hiddenClass b =
    if b then
        " hidden"
    else
        ""


leftButtonView : Model -> Html Msg
leftButtonView model =
    button
        [ class ("circle-button-2" ++ selectedClass (model.selection == LeftSelection) ++ hiddenClass (isHidden model))
        , onClick <| SelectionClickedMsg LeftSelection
        ]
        [ Atom (MetaVar MetaA) |> Render.centerTermDiv
        ]


symbolButtonView : Model -> Html Msg
symbolButtonView model =
    button
        [ class ("circle-button-2" ++ selectedClass (model.selection == SymbolSelection))
        , onClick <| SelectionClickedMsg SymbolSelection
        ]
        [ Render.starDiv
        ]


rightButtonView : Model -> Html Msg
rightButtonView model =
    button
        [ class ("circle-button-2" ++ selectedClass (model.selection == RightSelection) ++ hiddenClass (isHidden model))
        , onClick <| SelectionClickedMsg RightSelection
        ]
        [ Atom (MetaVar MetaB) |> Render.centerTermDiv
        ]


toggle : Int -> Maybe Int -> Maybe Int
toggle i m =
    if m == Just i then
        Nothing
    else
        Just i


update : Msg -> Model -> Out
update msg model =
    case msg of
        IgnoreMsg ->
            NoChangeOut

        ListItemClickedMsg i ->
            case model.selection of
                LeftSelection ->
                    ChangedOut { model | left = toggle i model.left }

                SymbolSelection ->
                    ChangedOut { model | symbol = toggle i model.symbol }

                RightSelection ->
                    ChangedOut { model | right = toggle i model.right }

        CancelClickedMsg ->
            ExitOut

        OkClickedMsg ->
            let
                left =
                    Maybe.map (\i -> unsafeGet i model.scratch) model.left

                symbol =
                    Maybe.map (\i -> unsafeGet i model.symbols) model.symbol

                right =
                    Maybe.map (\i -> unsafeGet i model.scratch) model.right
            in
                AddOut (formula model.focus left symbol right)

        SelectionClickedMsg x ->
            ChangedCmdOut { model | selection = x } (scrollToTopCmd IgnoreMsg)


itemView : (Int -> Bool) -> Int -> Html Msg -> Html Msg
itemView isSelected idx svg =
    li
        [ class ("term-item" ++ selectedClass (isSelected idx))
        , onClick (ListItemClickedMsg idx)
        ]
        [ svg ]


isSelected : Maybe Int -> Int -> Bool
isSelected selection i1 =
    case selection of
        Nothing ->
            False

        Just i2 ->
            i1 == i2


symbolListView : Maybe Int -> List Symbol -> Html Msg
symbolListView selection symbols =
    symbols
        |> List.map Render.symbolSvg
        |> List.indexedMap (itemView (isSelected selection))
        |> ul []


scratchListView : Maybe Int -> List Term -> Html Msg
scratchListView selection scratch =
    scratch
        |> List.map Render.leftTermDiv
        |> List.indexedMap (itemView (isSelected selection))
        |> ul []


{-| Generates the formula term with metavariables.
-}
formula : Term -> Maybe Term -> Maybe Symbol -> Maybe Term -> Term
formula focus left symbol right =
    let
        prefix op =
            Unary op (Maybe.withDefault (Atom (MetaVar MetaB)) right)

        binary op =
            Binary op (Maybe.withDefault (Atom (MetaVar MetaA)) left) (Maybe.withDefault (Atom (MetaVar MetaB)) right)
    in
        case symbol of
            Nothing ->
                focus

            Just s ->
                case s of
                    Symbol.Top ->
                        Atom Top

                    Symbol.Bot ->
                        Atom Bot

                    Symbol.VarA ->
                        Atom VarA

                    Symbol.VarB ->
                        Atom VarB

                    Symbol.VarC ->
                        Atom VarC

                    Symbol.Negation ->
                        prefix Not

                    Symbol.Conjunction ->
                        binary Conjunction

                    Symbol.Disjunction ->
                        binary Disjunction

                    Symbol.Equivalence ->
                        binary Equivalence

                    Symbol.Implication ->
                        binary Implication


{-| Whether there is a valid term made from the selections.
-}
isValid : Maybe Term -> Maybe Symbol -> Maybe Term -> Bool
isValid left symbol right =
    let
        prefix =
            case right of
                Nothing ->
                    False

                Just t2 ->
                    True

        binary =
            case ( left, right ) of
                ( Just t1, Just t2 ) ->
                    True

                _ ->
                    False
    in
        case symbol of
            Nothing ->
                True

            Just s ->
                case s of
                    Symbol.Top ->
                        True

                    Symbol.Bot ->
                        True

                    Symbol.VarA ->
                        True

                    Symbol.VarB ->
                        True

                    Symbol.VarC ->
                        True

                    Symbol.Negation ->
                        prefix

                    Symbol.Conjunction ->
                        binary

                    Symbol.Disjunction ->
                        binary

                    Symbol.Equivalence ->
                        binary

                    Symbol.Implication ->
                        binary
