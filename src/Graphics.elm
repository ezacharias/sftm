module Graphics exposing (..)

import Svg as S exposing (Svg, Attribute)
import Svg.Attributes as A


{-| Used for focus out.
-}
ring : String -> Svg msg
ring color =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "16px"
        , A.height "16px"
        , A.viewBox "0 0 160 160"
        , A.fill "none"
        , A.stroke color
        ]
        [ S.circle [ A.strokeWidth "20", A.cx "80", A.cy "80", A.r "60" ] []
        ]


{-| Used for focus in.
-}
circle : String -> Svg msg
circle color =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "16px"
        , A.height "16px"
        , A.viewBox "0 0 160 160"
        , A.fill color
        , A.stroke "none"
        ]
        [ S.circle [ A.cx "80", A.cy "80", A.r "30" ] []
        ]


{-| Used for the top-right menu.
-}
dots3 : Svg msg
dots3 =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "16px"
        , A.height "16px"
        , A.viewBox "0 0 160 160"
        , A.fill "White"
        , A.stroke "none"
        ]
        [ S.circle [ A.cx "80", A.cy "30", A.r "15" ] []
        , S.circle [ A.cx "80", A.cy "80", A.r "15" ] []
        , S.circle [ A.cx "80", A.cy "130", A.r "15" ] []
        ]


{-| Used for the pop-up menu.
-}
upDownArrows : Svg msg
upDownArrows =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "16px"
        , A.height "16px"
        , A.viewBox "0 0 160 160"
        , A.fill "White"
        , A.stroke "none"
        ]
        [ S.path [ A.d "M80 20L120 60L40 60Z" ] []
        , S.path [ A.d "M80 140L120 100L40 100Z" ] []
        ]


{-| Used for the back button.
-}
leftAngle : Svg msg
leftAngle =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 200 200"
        , A.fill "none"
        , A.stroke "White"
        , A.strokeLinecap "round"
        , A.strokeLinejoin "round"
        ]
        [ S.path [ A.strokeWidth "20", A.d "M120 40L80 100L120 160" ] []
        ]


{-| Used in problem notes.
-}
lowerWhiteTombstone : Svg msg
lowerWhiteTombstone =
    S.svg
        [ A.style <|
            "transform: scale(1,-1);"
                ++ "position: relative;"
                ++ "top: 3px;"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 200 200"
        , A.fill "none"
        , A.stroke "White"
        , A.strokeLinecap "round"
        , A.strokeLinejoin "round"
        ]
        -- [ S.path [ A.strokeWidth "16", A.d "M56.74 30L143.26 30L143.26 170L56.74 170Z" ] []
        [ S.desc [] [ S.text "Tombstone" ]
        , S.path [ A.strokeWidth "15", A.d "M56 30L140 30L140 170L56 170Z" ] []
        ]


{-| Used for complete problems.
-}
whiteTombstone : Svg msg
whiteTombstone =
    S.svg
        [ A.style <|
            "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 200 200"
        , A.fill "none"
        , A.stroke "White"
        , A.strokeLinecap "round"
        , A.strokeLinejoin "round"
        ]
        -- [ S.path [ A.strokeWidth "16", A.d "M56.74 30L143.26 30L143.26 170L56.74 170Z" ] []
        [ S.path [ A.strokeWidth "15", A.d "M56 30L140 30L140 170L56 170Z" ] []
        ]


{-| Used for incomplete problems.
-}
dashedTombstone : Svg msg
dashedTombstone =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 200 200"
        , A.fill "none"
        -- , A.stroke "LightSlateGrey"
        , A.stroke "#CFCFCF"
        , A.strokeLinecap "round"
        , A.strokeLinejoin "round"
        , A.strokeDasharray "0 28"
        ]
        [ S.path [ A.strokeWidth "10", A.d "M56 30L140 30L140 170L56 170Z" ] []
        ]


{-| Used for the arrow/target button.
-}
arrow : Svg msg
arrow =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 40 40"
        , A.fill "#E0E0E0"
        ]
        [ S.path [ A.strokeWidth "10", A.d "M39 20L28 14L33 19L13 19L10 16L6 16L9 19L8 19L5 16L1 16L5 20L1 24L5 24L8 21L9 21L6 24L10 24L13 21L33 21L28 26Z" ] []
        ]


{-| Used for the arrow/target button.
-}
target : Svg msg
target =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 40 40"
        , A.fill "none"
        , A.stroke "none"
        ]
        [ S.circle [ A.fill "#F0D0D0", A.cx "20", A.cy "20", A.r "3" ] []
        , S.circle [ A.stroke "#E0E0E0", A.strokeWidth "2", A.cx "20", A.cy "20", A.r "7" ] []
        , S.circle [ A.stroke "#E0E0E0", A.strokeWidth "2", A.cx "20", A.cy "20", A.r "12" ] []
        ]


{-| Used in problem notes.
-}
lowerArrow : Svg msg
lowerArrow =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "20px"
        , A.height "20px"
        , A.viewBox "0 0 40 40"
        , A.fill "#E0E0E0"
        , A.style "position: relative; top: 5px;"
        ]
        [ S.path [ A.strokeWidth "10", A.d "M39 20L28 14L33 19L13 19L10 16L6 16L9 19L8 19L5 16L1 16L5 20L1 24L5 24L8 21L9 21L6 24L10 24L13 21L33 21L28 26Z" ] []
        ]


{-| The scratch pad delete X.
-}
delete : Svg msg
delete =
    S.svg
        [ A.style <| "transform: scale(1,-1);"
        , A.width "28px"
        , A.height "28px"
        , A.viewBox "0 0 28 28"
        , A.fill "none"
        , A.stroke "none"
        , A.strokeLinecap "round"
        ]
        [ S.circle [ A.fill "Crimson", A.cx "14", A.cy "14", A.r "12" ] []
        , S.path [ A.stroke "White", A.strokeWidth "1.5", A.d "M8 8L20 20M8 20L20 8" ] []
        ]
