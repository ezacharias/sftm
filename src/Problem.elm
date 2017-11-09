module Problem exposing (..)

import Html exposing (Html)
import Json.Decode exposing (Decoder)
import Json.Decode.Pipeline
import Json.Encode exposing (Value)
import Path exposing (Path)
import Rule exposing (Rule)
import Step exposing (Step)
import Symbol exposing (Symbol)
import Term exposing (..)


{-| Problem descriptions use this record.
-}
type alias StaticProblem =
    { description : String
    , notes : List (Html Never)
    , start : Term
    , finish : Term
    , rules : List Rule
    , scratch : List Symbol
    }


{-| A problem as stored in the problem list.
-}
type alias Problem =
    { description : String
    , notes : List (Html Never)
    , rules : List Rule
    , scratch : List Term
    , scratchSymbols : List Symbol
    , solved : Bool
    , start : Term
    , finish : Term
    , history : List Step
    , future : List Step
    , proof : Maybe (List Step)
    }


{-| This information is saved to local storage.
-}
type alias LocalStorageProblem =
    { scratch : List Term
    , solved : Bool
    , history : List Step
    , future : List Step
    , proof : Maybe (List Step)
    }


init : List StaticProblem -> List Problem
init =
    List.map initProblem


initProblem : StaticProblem -> Problem
initProblem problemStatic =
    { description = problemStatic.description
    , notes = problemStatic.notes
    , rules = problemStatic.rules
    , scratchSymbols = problemStatic.scratch
    , scratch = []
    , solved = False
    , start = problemStatic.start
    , finish = problemStatic.finish
    , history = []
    , future = []
    , proof = Nothing
    }


pathEncoder : {} -> Value
pathEncoder _ =
    Json.Encode.object []


panelEncoder : {} -> Value
panelEncoder _ =
    Json.Encode.object []


encoder : Problem -> Value
encoder problem =
    localStorageEncoder (saveProblem problem)


localStorageEncoder : LocalStorageProblem -> Value
localStorageEncoder x =
    Json.Encode.object
        [ ( "scratch", Json.Encode.list (List.map Term.encoder x.scratch) )
        , ( "solved", Json.Encode.bool x.solved )
        , ( "history", Json.Encode.list (List.map Step.encoder x.history) )
        , ( "future", Json.Encode.list (List.map Step.encoder x.future) )
        , ( "proof", Maybe.withDefault Json.Encode.null (Maybe.map (Json.Encode.list << List.map Step.encoder) x.proof) )
        ]


localStorageDecoder : Decoder LocalStorageProblem
localStorageDecoder =
    Json.Decode.Pipeline.decode LocalStorageProblem
        |> Json.Decode.Pipeline.required "scratch" (Json.Decode.list Term.decoder)
        |> Json.Decode.Pipeline.required "solved" Json.Decode.bool
        |> Json.Decode.Pipeline.required "history" (Json.Decode.list Step.decoder)
        |> Json.Decode.Pipeline.required "future" (Json.Decode.list Step.decoder)
        |> Json.Decode.Pipeline.required "proof" (Json.Decode.nullable (Json.Decode.list Step.decoder))


saveProblem : Problem -> LocalStorageProblem
saveProblem x =
    { scratch = x.scratch
    , solved = x.solved
    , history = x.history
    , future = x.future
    , proof = x.proof
    }


restoreProblem : LocalStorageProblem -> Problem -> Problem
restoreProblem x p =
    { p
        | scratch = x.scratch
        , solved = x.solved
        , history = x.history
        , future = x.future
        , proof = x.proof
    }


reset : Problem -> Problem
reset problem =
    { problem
        | scratch = []
        , history = []
        , future = []
    }
