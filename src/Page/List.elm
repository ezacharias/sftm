module Page.List exposing (..)

import Graphics
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Utilities exposing (..)
import Problem exposing (..)
import Json.Decode


type alias Model =
    List Problem


type Msg
    = GoToProblemMsg Int
    | GoToAboutMsg
    | OnScrollMsg


view : Model -> Html Msg
view ps =
    div [ class "content-body" ]
        [ div [ id "scrolling", onScroll OnScrollMsg ]
            [ ol [ class "top-list" ] (List.indexedMap viewItem ps)
            , viewAbout
            ]
        ]


viewItem : Int -> Problem -> Html Msg
viewItem i p =
    li [ class "clickable listing-problem-item", onClick <| GoToProblemMsg i ]
        [ div [ class "listing-tombstone" ]
            [ viewTombstone p.solved
            ]
        , div [ class "listing-description" ]
            [ div [ class "listing-problem-text" ] [ text <| "Problem " ++ toString (i + 1) ]
            , div [ class "listing-title-text" ] [ text p.description ]
            ]
        ]


viewTombstone : Bool -> Html Msg
viewTombstone isSolved =
    if isSolved then
        Graphics.whiteTombstone
    else
        Graphics.dashedTombstone

viewAbout : Html Msg
viewAbout =
    div [ class "clickable listing-about-item", onClick GoToAboutMsg ]
        [ text "About" ]
