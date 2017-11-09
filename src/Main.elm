module Main
    exposing
        ( main
        )

import Dict exposing (Dict)
import Dom.Scroll
import Html exposing (Html)
import Json.Decode
import Json.Decode.Pipeline
import Json.Encode exposing (Value)
import Navigation exposing (Location)
import Page.About
import Page.List
import Page.Proof
import Page.Solve
import Platform.Cmd as Cmd
import Platform.Sub as Sub
import Ports
import Problem exposing (Problem)
import Problems
import Task
import Utilities exposing (..)


type alias Model =
    { problems : List Problem
    , scrollY : Float
    , page : Page
    }


type Page
    = ListPage
    | AboutPage
    | SolvePage Int Page.Solve.Model
    | ProofPage Page.Proof.Model


type Msg
    = IgnoreMsg
    | LocalStorageChangedMsg (Maybe String)
    | GoToProblemMsg Int
    | GoToAboutMsg
    | OnScrollMsg
    | SaveScrollMsg Float
    | LocationUpdateMsg Location
    | AboutBackButtonClickedMsg
    | SolvePageMsg Page.Solve.Msg


type alias Flags =
    { local : Maybe String }


main : Program Flags Model Msg
main =
    Navigation.programWithFlags
        LocationUpdateMsg
        { subscriptions = subscriptions
        , init = init
        , view = view
        , update = update
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Ports.onLocalStorageChange LocalStorageChangedMsg


init : Flags -> Location -> ( Model, Cmd Msg )
init flags location =
    let
        model =
            decodeModel flags

        ( model2, cmd ) =
            locationUpdate False location model
    in
        ( model2, Cmd.batch [ cmd, Ports.initialize () ] )


view : Model -> Html Msg
view model =
    case model.page of
        ListPage ->
            Html.map listMsg (Page.List.view model.problems)

        AboutPage ->
            Page.About.view AboutBackButtonClickedMsg version

        SolvePage i solveModel ->
            Html.map SolvePageMsg (Page.Solve.view (currentProblem model) solveModel)

        ProofPage proofModel ->
            (Page.Proof.view (GoToProblemMsg proofModel.index) proofModel)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        IgnoreMsg ->
            ( model
            , Cmd.none
            )

        LocalStorageChangedMsg value ->
            case value of
                Nothing ->
                    ( model, Cmd.none )

                Just str ->
                    case Json.Decode.decodeString (decodeLocalStorage model) str of
                        Ok newModel ->
                            ( modelUpdated newModel model, Cmd.none )

                        Err errS ->
                            Debug.log errS ( model, Cmd.none )

        GoToProblemMsg i ->
            ( model
            , Navigation.newUrl (fullPath ++ "/problem-" ++ toString (1 + i) ++ "/")
            )

        GoToAboutMsg ->
            ( model
            , Navigation.newUrl (fullPath ++ "/about/")
            )

        SolvePageMsg msg1 ->
            case Page.Solve.update (currentProblem model) msg1 (currentSolvePageModel model) of
                Page.Solve.UnchangedOutMsg ->
                    ( model, Cmd.none )

                Page.Solve.ModelChangedOutMsg solvePageModel ->
                    let
                        newModel =
                            setCurrentSolvePageModel solvePageModel model
                    in
                        ( newModel
                        , Cmd.none
                        )

                Page.Solve.ProblemChangedOutMsg problem1 solvePageModel ->
                    let
                        newModel =
                            model
                                |> setCurrentProblem problem1
                                |> setCurrentSolvePageModel solvePageModel
                    in
                        ( newModel
                        , Ports.setLocalStorage (encodeLocalStorage newModel)
                        )

                Page.Solve.SolvedOutMsg steps0 problem0 ->
                    let
                        steps =
                            case problem0.proof of
                                Nothing ->
                                    steps0

                                Just steps1 ->
                                    if List.length steps1 < List.length steps0 then
                                        steps1
                                    else
                                        steps0

                        problem1 =
                            Problem.reset problem0

                        problem2 =
                            { problem1 | proof = Just steps }

                        newModel1 =
                            setCurrentProblem problem2 model

                        index =
                            problemIndex model

                        isInitial =
                            case problem0.proof of
                                Nothing ->
                                    True

                                Just _ ->
                                    False
                    in
                        ( newModel1
                        , Cmd.batch
                            [ Ports.setLocalStorage (encodeLocalStorage newModel1)
                            , Ports.problemSolved { problemIndex = index, isInitial = isInitial, stepCount = List.length steps0 }
                            , Navigation.newUrl mainPath
                            ]
                        )

                Page.Solve.ModelCmdChangedOutMsg solvePageModel cmd ->
                    let
                        newModel =
                            model |> setCurrentSolvePageModel solvePageModel
                    in
                        ( newModel
                        , Cmd.map SolvePageMsg cmd
                        )

                Page.Solve.ExitOutMsg ->
                    ( model, Navigation.newUrl mainPath )

                Page.Solve.ShowProofOutMsg ->
                    ( model, Navigation.newUrl (fullPath ++ "/problem-" ++ toString (problemIndex model + 1) ++ "/proof/") )

        AboutBackButtonClickedMsg ->
            ( model, Navigation.newUrl mainPath )

        OnScrollMsg ->
            ( model
            , Task.attempt (Result.map SaveScrollMsg >> Result.withDefault IgnoreMsg) (Dom.Scroll.y "scrolling")
            )

        SaveScrollMsg y ->
            let
                newModel =
                    { model | scrollY = y }
            in
                ( newModel
                , Cmd.none
                )

        LocationUpdateMsg location ->
            locationUpdate True location model


{-| This occurs when localStorage changes.
-}
modelUpdated : Model -> Model -> Model
modelUpdated newModel currentModel =
    case currentModel.page of
        SolvePage i _ ->
            let
                currentProblem =
                    unsafeGet i currentModel.problems

                newProblem =
                    unsafeGet i newModel.problems
            in
                if currentProblem == newProblem then
                    newModel
                else
                    { newModel | page = SolvePage i (Page.Solve.init i newProblem) }

        _ ->
            newModel


{-| Updates the model based on the URL path. The isInit flag makes sure it does
not register a page change with GoogleAnalytics on init.
-}
locationUpdate : Bool -> Location -> Model -> ( Model, Cmd Msg )
locationUpdate isInit location model =
    let
        setPage =
            if isInit then
                Ports.setPage
            else
                \ignore -> Cmd.none

        setLocalStorage =
            encodeLocalStorage >> Ports.setLocalStorage

        shortPath =
            location.pathname
    in
        case Dict.get shortPath paths of
            Nothing ->
                ( model, Navigation.newUrl mainPath )

            Just f ->
                f isInit model


paths : Dict String (Bool -> Model -> ( Model, Cmd Msg ))
paths =
    Dict.fromList
        ([ ( "/", rootLocation )
         , ( "/about/", aboutLocation )
         ]
            ++ (List.map
                    (\i -> ( "/problem-" ++ toString i ++ "/", problemLocation i ))
                    (List.range 1 (List.length Problems.problems + 1))
               )
            ++ (List.map
                    (\i -> ( "/problem-" ++ toString i ++ "/proof/", proofLocation i ))
                    (List.range 1 (List.length Problems.problems + 1))
               )
        )


setPage : Bool -> String -> Cmd msg
setPage isInit path =
    if isInit then
        Ports.setPage path
    else
        Cmd.none


setLocalStorage : Model -> Cmd msg
setLocalStorage =
    encodeLocalStorage >> Ports.setLocalStorage


rootLocation : Bool -> Model -> ( Model, Cmd Msg )
rootLocation isInit model =
    case model.page of
        ListPage ->
            ( model, Cmd.none )

        _ ->
            let
                newModel =
                    { model | page = ListPage }
            in
                ( newModel
                , Cmd.batch
                    [ setPage isInit "/"
                    , setLocalStorage newModel
                    , Task.attempt (\result -> IgnoreMsg) (Dom.Scroll.toY "scrolling" newModel.scrollY)
                    ]
                )


aboutLocation : Bool -> Model -> ( Model, Cmd Msg )
aboutLocation isInit model =
    case model.page of
        AboutPage ->
            ( model, Cmd.none )

        _ ->
            let
                newModel =
                    { model | page = AboutPage }
            in
                ( newModel
                , Cmd.batch
                    [ setPage isInit "/about/"
                    , setLocalStorage newModel
                    ]
                )


problemLocation : Int -> Bool -> Model -> ( Model, Cmd Msg )
problemLocation i isInit model =
    let
        idx =
            i - 1

        isSame =
            case model.page of
                SolvePage j _ ->
                    idx == j

                _ ->
                    False
    in
        if isSame then
            ( model, Cmd.none )
        else
            let
                newModel =
                    { model | page = SolvePage idx (Page.Solve.init idx (unsafeGet idx model.problems)) }
            in
                ( newModel
                , Cmd.batch
                    [ setPage isInit ("/problem-" ++ toString i ++ "/")
                    , setLocalStorage newModel
                    , Task.attempt (\result -> IgnoreMsg) (Dom.Scroll.toY "scrolling" 0.0)
                    ]
                )


proofLocation : Int -> Bool -> Model -> ( Model, Cmd Msg )
proofLocation i isInit model =
    let
        idx =
            i - 1

        isSame =
            case model.page of
                ProofPage m ->
                    idx == m.index

                _ ->
                    False

        problem =
            unsafeGet idx model.problems
    in
        if isSame then
            ( model, Cmd.none )
        else
            case problem.proof of
                Just steps ->
                    let
                        proofModel =
                            { name = problem.description
                            , index = idx
                            , start = problem.start
                            , steps = steps
                            , rules = problem.rules
                            }

                        newModel =
                            { model | page = ProofPage proofModel }
                    in
                        ( newModel
                        , Cmd.batch
                            [ setPage isInit ("/problem-" ++ toString i ++ "/proof/")
                            , setLocalStorage newModel
                            , Task.attempt (\result -> IgnoreMsg) (Dom.Scroll.toTop "scrolling")
                            , Task.attempt (\result -> IgnoreMsg) (Dom.Scroll.toLeft "scrolling")
                            ]
                        )

                Nothing ->
                    ( model, Navigation.newUrl mainPath )


initialModel : Model
initialModel =
    { problems = Problem.init Problems.problems
    , page = ListPage
    , scrollY = 0.0
    }


decodeModel : Flags -> Model
decodeModel storage =
    let
        decodeLocal str =
            case Json.Decode.decodeString (decodeLocalStorage initialModel) str of
                Ok model0 ->
                    model0

                Err errS ->
                    Debug.log errS initialModel

        model =
            Maybe.withDefault
                -- This occurs during the first run of the site (when there is nothing in localStorage)
                initialModel
                -- This occurs during all other runs
                (Maybe.map decodeLocal storage.local)
    in
        model


listMsg : Page.List.Msg -> Msg
listMsg msg =
    case msg of
        Page.List.GoToProblemMsg i ->
            GoToProblemMsg i

        Page.List.GoToAboutMsg ->
            GoToAboutMsg

        Page.List.OnScrollMsg ->
            OnScrollMsg


currentProblem : Model -> Problem
currentProblem model =
    unsafeGet (problemIndex model) model.problems


problemIndex : Model -> Int
problemIndex model =
    case model.page of
        ListPage ->
            Debug.crash "impossible"

        AboutPage ->
            Debug.crash "impossible"

        SolvePage i _ ->
            i

        ProofPage _ ->
            Debug.crash "impossible"


setCurrentProblem : Problem -> Model -> Model
setCurrentProblem problem model =
    { model | problems = set (problemIndex model) problem model.problems }


currentSolvePageModel : Model -> Page.Solve.Model
currentSolvePageModel model =
    case model.page of
        ListPage ->
            Debug.crash "impossible"

        AboutPage ->
            Debug.crash "impossible"

        SolvePage i solvePageModel ->
            solvePageModel

        ProofPage _ ->
            Debug.crash "impossible"


setCurrentSolvePageModel : Page.Solve.Model -> Model -> Model
setCurrentSolvePageModel solvePageModel model =
    case model.page of
        ListPage ->
            Debug.crash "impossible"

        AboutPage ->
            Debug.crash "impossible"

        SolvePage i _ ->
            { model | page = SolvePage i solvePageModel }

        ProofPage _ ->
            Debug.crash "impossible"


encodeLocalStorage : Model -> String
encodeLocalStorage model =
    Json.Encode.encode 4 (localStorageValue model)


localStorageValue : Model -> Value
localStorageValue model =
    Json.Encode.object
        [ ( "version", Json.Encode.int version )
        , ( "problems", Json.Encode.list (List.map Problem.encoder model.problems) )
        ]


decodeLocalStorage : Model -> Json.Decode.Decoder Model
decodeLocalStorage model =
    let
        f version1 ps =
            if version1 == version then
                { model | problems = List.map2 Problem.restoreProblem ps model.problems }
            else
                model
    in
        Json.Decode.Pipeline.decode f
            |> Json.Decode.Pipeline.required "version" Json.Decode.int
            |> Json.Decode.Pipeline.required "problems" (Json.Decode.list Problem.localStorageDecoder)


fullPath : String
fullPath =
    "https://sftm.schlussweisen.com"


mainPath : String
mainPath =
    fullPath ++ "/"


version : Int
version =
    34
