port module Ports exposing (..)

{-| All ports.
-}


{-| Swaps the welcome screen for the Elm view.
-}
port initialize : () -> Cmd msg


{-| Google Analytics event.
-}
port sendEvent : { category : String, action : String, label : String } -> Cmd msg


problemSolved : { problemIndex : Int, isInitial : Bool, stepCount : Int } -> Cmd msg
problemSolved x =
    sendEvent
        { category = "Problem-" ++ String.padLeft 2 '0' (toString (x.problemIndex + 1))
        , action =
            "Solved-"
                ++ if x.isInitial then
                    "Initial"
                   else
                    "Subsequent"
        , label = "Steps-" ++ String.padLeft 3 '0' (toString (min x.stepCount 250))
        }


{-| Google Analytics event.
-}
port setPage : String -> Cmd msg


port setLocalStorage : String -> Cmd msg


port onLocalStorageChange : (Maybe String -> msg) -> Sub msg


{-| Copy to clipboard.
-}
port copy : String -> Cmd msg
