module Dialog.Transformation exposing (..)

import Graphics
import Html exposing (Html, div, span, text, button, ul, li)
import Html.Attributes exposing (id, class, disabled)
import Html.Events exposing (onClick)
import Render
import Rule exposing (Rule)
import Svg
import Svg.Attributes as SA
import Symbol exposing (Symbol)
import Term exposing (..)
import Transformation exposing (Transformation)
import Transformations
import Utilities exposing (unsafeGet, castHtml, fromJust, isNothing)


type alias Model =
    -- The term displayed in the formula div
    { display : Term

    -- The metavar
    , option : MetaVar

    -- The list of options
    , options : List Term

    -- The selected term
    , selection : Maybe Term
    , rule : Rule
    , transformation : Transformation
    }


type Msg
    = EmptyMsg
    | ListItemClickedMsg Term
    | CancelClickedMsg
    | OkClickedMsg


type Out
    = EmptyOut
    | ChangedOut Model
    | CancelOut
    | OkOut Transformation Term



-- The rule has been reversed if needed.


init : Term -> List Term -> List Term -> Rule -> Transformation -> Model
init focus context scratch rule transformation =
    let
        -- Just the metavariables we need to choose terms for
        emptyDict =
            Term.addMetavariables transformation.display []

        -- Fill in metavariablse from the focus and display.
        replaceDict =
            emptyDict
                |> Transformations.unify transformation.display rule.right
                |> fromJust
                |> Term.addMetavariables rule.left
                |> Transformations.unify focus rule.left
                |> fromJust
                |> Term.occupy

        -- Substitute out any filled in metavariables.
        antecedents1 =
            List.map (Transformations.substitute replaceDict) rule.antecedents

        -- Fills in the dictionary using the antecedents
        dict1 =
            Transformations.reallyAntecedents focus rule.right scratch context antecedents1 emptyDict

        -- Any entries which are still empty should have the scratch list added
        fullDict =
            Transformations.dictionaryAddScratch scratch dict1

        -- There should only be one metavariable
        ( option, options ) =
            case fullDict of
                [ e ] ->
                    e

                _ ->
                    Debug.crash "impossible"
    in
        { display = transformation.display
        , option = option
        , options = options
        , selection = Nothing
        , rule = rule
        , transformation = transformation
        }


view : Model -> Html Msg
view model =
    div [ class "content-body" ]
        [ div [ class "nav-bar" ]
            [ div [] []
            , div [ class "top-title" ] [ text "Transformation" ]
            , div [] []
            ]
        , div [ class "main-formula" ]
            [ Render.formulaHtml0 model.display
            ]
        , div [ class "dialog-control" ]
            [ button [ class "basic", onClick CancelClickedMsg ] [ text "Cancel" ]
            , div [ Html.Attributes.style [ ( "width", "8px" ) ] ] []
            , button [ class "basic", disabled (isNothing model.selection), onClick OkClickedMsg ] [ text "OK" ]
            ]
        , div [ class "dialog-command" ]
            [ button
                [ class ("circle-button-2 selected")
                , onClick <| EmptyMsg
                ]
                [ Atom (MetaVar model.option) |> Render.centerTermDiv
                ]
            ]
        , div [ id "scrolling", class "panel-body" ]
            [ listView model.selection model.options ]
        ]


listView : Maybe Term -> List Term -> Html Msg
listView selection options =
    ul [] (List.map (itemView selection) options)


itemView : Maybe Term -> Term -> Html Msg
itemView selection option =
    li
        [ class ("term-item" ++ selectedClass (selection == Just option))
        , onClick <| ListItemClickedMsg option
        ]
        [ option |> Render.leftTermDiv
        ]


selectedClass b =
    if b then
        " selected"
    else
        ""


update : Msg -> Model -> Out
update msg model =
    case msg of
        EmptyMsg ->
            EmptyOut

        ListItemClickedMsg term ->
            let
                newModel =
                    if Just term == model.selection then
                        { model
                            | display = model.transformation.display
                            , selection = Nothing
                        }
                    else
                        { model
                            | display = Transformations.substitute [ ( model.option, [ term ] ) ] model.transformation.display
                            , selection = Just term
                        }
            in
                ChangedOut newModel

        CancelClickedMsg ->
            CancelOut

        OkClickedMsg ->
            OkOut model.transformation model.display
