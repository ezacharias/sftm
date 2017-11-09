module Page.Proof exposing (..)

import Graphics
import Html exposing (Html, div, span, text, button, ol, li)
import Html.Attributes exposing (id, class, title, disabled, style)
import Html.Events exposing (onClick)
import Render
import Rule exposing (Rule)
import Step exposing (Step)
import Term exposing (Term)
import Utilities exposing (unsafeGet)


type alias Model =
    { name : String
    , index : Int
    , start : Term
    , steps : List Step
    , rules : List Rule
    }


view : a -> Model -> Html a
view msg model =
    let
        startShape =
            Render.midTermShape model.start

        shapes =
            List.map ((.term) >> Render.midTermShape) model.steps

        width =
            List.foldl max 0 (List.map (.width) (startShape :: shapes))
    in
        div [ class "content-body" ]
            [ div [ class "nav-bar" ]
                [ button [ class "nav-bar-button", title "Back", onClick msg ] [ Graphics.leftAngle ] ]

            -- This should scroll horizontally and vertically
            , div [ id "scrolling", class "proof" ]
                [ div [ class "proof-body" ]
                    [ div [ class "proof-description" ] [ text <| "Problem " ++ toString (model.index + 1) ++ ": " ++ model.name ]
                    , div [ class "proof-type" ] [ text "Proof: By equivalence." ]
                    , ol [ class "proof-list" ]
                        (viewStart width model :: List.indexedMap (viewStep width model) model.steps)
                    , div [ class "proof-tombstone" ] [ Graphics.whiteTombstone ]
                    ]
                ]
            ]


viewStart : Float -> Model -> Html a
viewStart formulaWidth model =
    li [ class "proof-step" ]
        [ div [ class "proof-start" ] [ text "Start " ]
        , div [ class "proof-formula", style [ ( "width", toString (formulaWidth / 850) ++ "em" ) ] ]
            [ model.start |> Render.leftTermDiv ]
        ]


viewStep : Float -> Model -> Int -> Step -> Html a
viewStep formulaWidth model i step =
    li [ class "proof-step" ]
        [ div [ class "proof-numbering" ] [ text <| toString (i + 1) ]
        , div [ class "proof-formula", style [ ( "width", toString (formulaWidth / 850) ++ "em" ) ] ]
            [ step.term |> Render.leftTermDiv ]
        , div [ class "proof-rule" ]
            [ text <|
                (unsafeGet step.rule model.rules).name
                    ++ if step.isReversed then
                        " (reverse)"
                       else
                        ""
            ]
        ]
