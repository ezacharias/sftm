module Page.Solve exposing (..)

import Html exposing (Html, div, span, text, button, ul, ol, li)
import Html.Attributes exposing (id, class, title, disabled, style)
import Html.Events exposing (onClick)
import Utilities exposing (castHtml, isNothing, fromJust, remove, scrollToTopCmd, scrollToBottomCmd, unsafeGet, ariaHidden)
import Problem exposing (Problem)
import Json.Encode as Encode exposing (Value)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as DecodePipeline
import Graphics
import Render
import Rule
import Svg
import Svg.Attributes as SA
import Path exposing (Path, PathNode(GoLeft, GoRight))
import Term exposing (..)
import Dialog.Scratch
import Dialog.Transformation
import Transformation exposing (Transformation)
import Transformations
import Task
import Ports
import Step exposing (Step)


type alias Model =
    { problemIndex : Int
    , direction : Direction
    , historyIndex : Int
    , futureIndex : Int
    , historyPath : Path
    , futurePath : Path
    , panel : Panel
    , contextSelection : Maybe Int
    , scratchSelection : Maybe Int
    , transformationSelection : Maybe Int

    -- These are not saved:
    , popUp : PopUp
    , dialog : Dialog

    -- These are calculated:
    , term : Term
    , focus : Term
    , context : List { path : Path, term : Term }
    , path : Path
    , transformations : List Transformation
    , solved : Bool
    }


type PopUp
    = NoPopUp
    | PanelSelectPopUp
    | SettingsPopUp
    | ResetPopUp
    | CopyPopUp


type Msg
    = IgnoreMsg
    | BackMsg
    | SolvedMsg
    | FocusLeftMsg
    | FocusOutMsg
    | FocusRightMsg
    | ChangeDirectionMsg
    | ShowPanelSelectMsg
    | PanelSelectBackgroundMsg
    | PanelSelectChoiceMsg Panel
    | ShowSettingsMsg
    | SettingsBackgroundMsg
    | SettingsCopyMsg
    | SettingsShowProofMsg
    | SettingsResetMsg
    | ResetPopUpCancelMsg
    | ResetPopUpResetMsg
    | ContextItemMsg Int
    | ScratchItemMsg Int
    | ScratchAddMsg
    | ScratchRemoveMsg
    | ScratchDialogMsg Dialog.Scratch.Msg
    | TransformationItemMsg Int
    | TransformationUseMsg
    | TransformationDialogMsg Dialog.Transformation.Msg
    | TransformationUndoMsg
    | TransformationRedoMsg
    | HistoryItemMsg Int


type OutMsg
    = UnchangedOutMsg
    | ModelChangedOutMsg Model
    | ProblemChangedOutMsg Problem Model
    | SolvedOutMsg (List Step) Problem
    | ModelCmdChangedOutMsg Model (Cmd Msg)
    | ExitOutMsg
    | ShowProofOutMsg



-- This is used to store the active panel in the model.


type Panel
    = NotesPanel
    | ContextPanel
    | ScratchPanel
    | TransformationsPanel
    | HistoryPanel
    | RulesPanel


type Dialog
    = NoDialog
    | TransformationDialog Dialog.Transformation.Model
    | ScratchDialog Dialog.Scratch.Model


type Direction
    = History
    | Future


init : Int -> Problem -> Model
init idx problem =
    refocus [] problem (reallyInit idx)


reallyInit : Int -> Model
reallyInit idx =
    { problemIndex = idx
    , direction = History
    , historyIndex = 0
    , futureIndex = 0
    , historyPath = []
    , futurePath = []
    , dialog = NoDialog
    , panel = NotesPanel
    , popUp = NoPopUp
    , contextSelection = Nothing
    , scratchSelection = Nothing
    , transformationSelection = Nothing

    -- These are calculated:
    , term = Atom Top
    , focus = Atom Top
    , context = []
    , path = []
    , transformations = []
    , solved = False
    }


view : Problem -> Model -> Html Msg
view problem model =
    case model.dialog of
        NoDialog ->
            viewNoDialog problem model

        TransformationDialog m ->
            Html.map TransformationDialogMsg (Dialog.Transformation.view m)

        ScratchDialog m ->
            Html.map ScratchDialogMsg (Dialog.Scratch.view m)


contextSelectionPath : Model -> Path
contextSelectionPath model =
    case model.contextSelection of
        Nothing ->
            []

        Just idx ->
            (unsafeGet idx model.context).path


viewNoDialog : Problem -> Model -> Html Msg
viewNoDialog problem model =
    div [ class "content-body" ]
        [ navBar model
        , div [ class "main-formula", modelAriaHidden model ]
            [ Render.formulaHtml2 (transformedTerm model) model.path (contextSelectionPath model)
            ]
        , div [ class "navigation", modelAriaHidden model ]
            (viewNavigationButtons model)
        , div [ class "panel-title landscape-hide", modelAriaHidden model ]
            ([ button [ class "panel-title-button", onClick ShowPanelSelectMsg ]
                [ div [ class "up-down-arrows" ] [ Graphics.upDownArrows ]
                , div [ class "panel-title-text" ] [ text (panelTitle model) ]
                ]
             ]
                ++ [ div [ class "grow" ] [] ]
                ++ viewTitleButtons problem model
            )
        , viewPanelBody problem model

        -- Capture clicks outside popup
        , case model.popUp of
            NoPopUp ->
                text ""

            _ ->
                div [ class "popup-background", title "Close Pop-Up", onClick PanelSelectBackgroundMsg ] []

        -- Show the popup
        , case model.popUp of
            NoPopUp ->
                text ""

            PanelSelectPopUp ->
                pop model

            SettingsPopUp ->
                settingsPop problem model

            ResetPopUp ->
                resetPop model

            CopyPopUp ->
                copyPop model
        ]


viewNavigationButtons : Model -> List (Html Msg)
viewNavigationButtons model =
    if isNothing model.transformationSelection then
        [ div [ class "time-arrow-size" ] []
        , button [ class "fab", title "In Left", onClick FocusLeftMsg, disabled (not <| canFocusLeft model) ]
            [ Graphics.circle (focusColor (canFocusLeft model)) ]
        , button [ class "fab", title "Out", onClick FocusOutMsg, disabled (not <| canFocusOut model) ]
            [ Graphics.ring (focusColor (canFocusOut model)) ]
        , button [ class "fab", title "In Right", onClick FocusRightMsg, disabled (not <| canFocusRight model) ]
            [ Graphics.circle (focusColor (canFocusRight model)) ]
        , case model.direction of
            History ->
                button [ class "time-arrow-size", title "Direction Forwards", onClick ChangeDirectionMsg ]
                    [ Graphics.arrow ]

            Future ->
                button [ class "time-arrow-size", title "Direction Backwards", onClick ChangeDirectionMsg ]
                    [ Graphics.target ]
        ]
    else
        [ button
            [ class ("basic" ++ metaClass (transformationIsMultiple model))
            , onClick TransformationUseMsg
            ]
            [ text "Apply" ]
        ]


selectedClass : Bool -> String
selectedClass b =
    if b then
        " selected"
    else
        ""


metaClass : Bool -> String
metaClass b =
    if b then
        " meta"
    else
        ""


focusColor : Bool -> String
focusColor b =
    if b then
        "White"
    else
        "SlateGrey"


viewTitleButtons : Problem -> Model -> List (Html Msg)
viewTitleButtons problem model =
    case model.panel of
        ScratchPanel ->
            [ button [ class "panel-button", onClick ScratchAddMsg ]
                [ text "Add" ]
            ]

        TransformationsPanel ->
            [ button [ class "panel-button", disabled (not (canUndo problem model)), onClick TransformationUndoMsg ]
                [ text "Undo" ]
            , button
                [ class "panel-button", disabled (not (canRedo problem model)), onClick TransformationRedoMsg ]
                [ text "Redo" ]
            ]

        _ ->
            []


canUndo : Problem -> Model -> Bool
canUndo problem model =
    case model.direction of
        History ->
            model.historyIndex < List.length problem.history

        Future ->
            model.futureIndex < List.length problem.future


canRedo : Problem -> Model -> Bool
canRedo problem model =
    case model.direction of
        History ->
            model.historyIndex > 0

        Future ->
            model.futureIndex > 0


panelTitle : Model -> String
panelTitle model =
    case model.panel of
        NotesPanel ->
            "Notes"

        ContextPanel ->
            "Context"

        ScratchPanel ->
            "Scratch Pad"

        TransformationsPanel ->
            "Transformations"

        HistoryPanel ->
            case model.direction of
                History ->
                    "History"

                Future ->
                    "Future"

        RulesPanel ->
            "Rules"


viewPanelBody : Problem -> Model -> Html Msg
viewPanelBody problem model =
    case model.panel of
        NotesPanel ->
            viewNotesPanel problem model

        ContextPanel ->
            viewContextPanel problem model

        ScratchPanel ->
            viewScratchPanel problem model

        TransformationsPanel ->
            viewTransformationsPanel problem model

        HistoryPanel ->
            viewHistoryPanel problem model

        RulesPanel ->
            viewRulesPanel problem model


viewNotesPanel : Problem -> Model -> Html Msg
viewNotesPanel problem model =
    div [ id "scrolling", class "landscape-hide notes-panel-body", modelAriaHidden model ]
        ([ Html.p [] [ Html.em [] [ Html.text problem.description ] ] ]
            ++ List.map castHtml problem.notes
        )


viewContextPanel : Problem -> Model -> Html Msg
viewContextPanel problem model =
    let
        f idx x =
            x.term
                |> (if model.contextSelection == Just idx then
                        Render.yellowLeftTermDiv
                    else
                        Render.leftTermDiv
                   )
                |> List.singleton
                |> li [ class ("term-item" ++ selectedClass (model.contextSelection == Just idx)), onClick (ContextItemMsg idx) ]
    in
        ol [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
            (List.indexedMap f model.context)


viewScratchPanel : Problem -> Model -> Html Msg
viewScratchPanel problem model =
    let
        f idx term =
            li [ class ("term-item" ++ selectedClass (model.scratchSelection == Just idx)) ]
                [ div [ class "term-item-formula", onClick (ScratchItemMsg idx) ] [ term |> Render.leftTermDiv ]
                , if model.scratchSelection == Just idx then
                    button [ class "scratch-remove-button", title "Delete", onClick ScratchRemoveMsg ] [ Graphics.delete ]
                  else
                    text ""
                ]
    in
        ol [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
            (List.indexedMap f problem.scratch)


viewTransformationsPanel : Problem -> Model -> Html Msg
viewTransformationsPanel problem model =
    let
        f idx sub =
            let
                rule =
                    unsafeGet sub.ruleIndex problem.rules
            in
                li
                    [ class ("rule-item" ++ selectedClass (model.transformationSelection == Just idx))
                    , onClick (TransformationItemMsg idx)
                    ]
                    [ div [ class "rule-name" ]
                        [ text rule.name
                        , if sub.isReversed then
                            span [ class "flipped" ] [ text "reversed" ]
                          else
                            text ""
                        ]
                    , rule |> Rule.reverseIf sub.isReversed |> Render.leftRuleDiv
                    ]
    in
        ul [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
            (List.indexedMap f model.transformations)


viewHistoryPanel : Problem -> Model -> Html Msg
viewHistoryPanel problem model =
    let
        f len idx1 idx2 step =
            li
                [ class ("history-item" ++ selectedClass (idx1 == idx2))
                , onClick (HistoryItemMsg idx2)
                ]
                [ div [ class "history-gutter" ]
                    (if len < 0 then
                        [ text (toString (len + idx2)), span [ class "invisible" ] [ text "-" ] ]
                     else
                        [ text (toString (len - idx2)) ]
                    )
                , step.term |> Render.leftTermDiv
                ]
    in
        case model.direction of
            History ->
                ol [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
                    (li
                        [ class
                            ("history-item"
                                ++ if model.historyIndex == List.length problem.history then
                                    " selected"
                                   else
                                    ""
                            )
                        , onClick (HistoryItemMsg (List.length problem.history))
                        ]
                        [ div [ class "history-gutter" ] [ text "Start" ]
                        , div [] [ problem.start |> Render.leftTermDiv ]
                        ]
                        :: List.reverse (List.indexedMap (f (List.length problem.history) model.historyIndex) problem.history)
                    )

            Future ->
                ol [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
                    ((List.indexedMap (f (negate (List.length problem.future)) model.futureIndex) problem.future)
                        ++ [ li
                                [ class ("history-item" ++ selectedClass (model.futureIndex == List.length problem.future))
                                , onClick (HistoryItemMsg (List.length problem.future))
                                ]
                                [ div [ class "history-gutter" ] [ text "End" ]
                                , div [] [ problem.finish |> Render.leftTermDiv ]
                                ]
                           ]
                    )


viewRulesPanel : Problem -> Model -> Html Msg
viewRulesPanel problem model =
    let
        f idx rule =
            li [ class "rule-item" ]
                [ div [ class "rule-name" ] [ text rule.name ]
                , rule |> Render.leftRuleDiv
                ]
    in
        ul [ id "scrolling", class "landscape-hide bottom-list", modelAriaHidden model ]
            (List.indexedMap f problem.rules)


canFocusLeft : Model -> Bool
canFocusLeft model =
    case model.focus of
        Binary _ _ _ ->
            True

        Unary _ _ ->
            False

        Atom _ ->
            False


canFocusOut : Model -> Bool
canFocusOut model =
    case model.path of
        [] ->
            False

        _ :: _ ->
            True


canFocusRight : Model -> Bool
canFocusRight model =
    case model.focus of
        Binary _ _ _ ->
            True

        Unary _ _ ->
            True

        Atom _ ->
            False


pop : Model -> Html Msg
pop model =
    div [ class "popup panel-popup" ]
        [ ul []
            [ li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg NotesPanel ]
                    [ text "Notes" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg ContextPanel ]
                    [ text "Context" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg ScratchPanel ]
                    [ text "Scratch Pad" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg TransformationsPanel ]
                    [ text "Transformations" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg HistoryPanel ]
                    [ case model.direction of
                        History ->
                            text "History"

                        Future ->
                            text "Future"
                    ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| PanelSelectChoiceMsg RulesPanel ]
                    [ text "Rules" ]
                ]
            ]
        ]


settingsPop : Problem -> Model -> Html Msg
settingsPop problem model =
    div [ class "popup settings-popup" ]
        [ ul []
            [ li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| SettingsCopyMsg ]
                    [ text "Copy focus as TeX" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", disabled (isNothing problem.proof), onClick <| SettingsShowProofMsg ]
                    [ text "Show proof…" ]
                ]
            , li [ class "panel-select-item" ]
                [ button [ class "panel-select-button", onClick <| SettingsResetMsg ]
                    [ text "Reset problem" ]
                ]
            ]
        ]


resetPop : Model -> Html Msg
resetPop model =
    div [ class "popup reset-popup" ]
        [ div [ class "reset-popup-text" ] [ text "Are you sure you want to reset this problem?" ]
        , div [ class "reset-popup-buttons" ]
            [ button [ class "panel-button", onClick ResetPopUpCancelMsg ] [ text "Cancel" ]
            , button [ class "panel-button", onClick ResetPopUpResetMsg ] [ text "Reset" ]
            ]
        ]


copyPop : Model -> Html Msg
copyPop model =
    div [ class "popup copy-popup" ]
        [ div [ class "copy-popup-text" ] [ text "Copied to clipboard." ]
        , div [ class "copy-popup-buttons" ]
            [ button [ class "panel-button", onClick ResetPopUpCancelMsg ] [ text "OK" ]
            ]
        ]


navBar : Model -> Html Msg
navBar model =
    div [ class "landscape-hide nav-bar", modelAriaHidden model ]
        [ if model.solved then
            button [ class "nav-bar-button", title "Q.E.D.", onClick SolvedMsg ] [ Graphics.whiteTombstone ]
          else
            button [ class "nav-bar-button", title "Back", onClick BackMsg ] [ Graphics.leftAngle ]
        , div [ class "top-title" ] [ text <| "Problem " ++ toString (model.problemIndex + 1) ]
        , button [ class "nav-bar-button", title "Menu", onClick ShowSettingsMsg ] [ Graphics.dots3 ]
        ]


update : Problem -> Msg -> Model -> OutMsg
update problem msg model =
    case msg of
        IgnoreMsg ->
            UnchangedOutMsg

        BackMsg ->
            ExitOutMsg

        SolvedMsg ->
            SolvedOutMsg (proofSteps problem model) { problem | solved = True }

        FocusLeftMsg ->
            ModelChangedOutMsg <| refocus (Path.left model.path) problem model

        FocusOutMsg ->
            ModelChangedOutMsg (refocus (Path.out model.path) problem model)

        FocusRightMsg ->
            ModelChangedOutMsg <| refocus (Path.right model.path) problem model

        ShowPanelSelectMsg ->
            ModelChangedOutMsg { model | popUp = PanelSelectPopUp }

        PanelSelectBackgroundMsg ->
            ModelChangedOutMsg { model | popUp = NoPopUp }

        PanelSelectChoiceMsg panelName ->
            if panelName == model.panel then
                ModelChangedOutMsg { model | popUp = NoPopUp }
            else
                let
                    newModel =
                        refocus model.path
                            problem
                            { model
                                | panel = panelName
                                , popUp = NoPopUp
                            }
                in
                    ModelCmdChangedOutMsg newModel (scrollingCmd newModel)

        ShowSettingsMsg ->
            ModelChangedOutMsg { model | popUp = SettingsPopUp }

        SettingsBackgroundMsg ->
            ModelChangedOutMsg { model | popUp = NoPopUp }

        SettingsCopyMsg ->
            ModelCmdChangedOutMsg { model | popUp = CopyPopUp } (Ports.copy <| Term.tex (transformedTerm model))

        SettingsResetMsg ->
            ModelChangedOutMsg { model | popUp = ResetPopUp }

        ResetPopUpCancelMsg ->
            ModelChangedOutMsg { model | popUp = NoPopUp }

        ResetPopUpResetMsg ->
            let
                newProblem =
                    Problem.reset problem

                newModel =
                    init model.problemIndex newProblem
            in
                ProblemChangedOutMsg newProblem newModel

        ScratchAddMsg ->
            ModelCmdChangedOutMsg
                { model | dialog = ScratchDialog (Dialog.Scratch.init problem.scratchSymbols problem.scratch model.focus) }
                (scrollToTopCmd IgnoreMsg)

        ScratchRemoveMsg ->
            let
                newProblem =
                    { problem | scratch = remove (fromJust model.scratchSelection) problem.scratch }
            in
                ProblemChangedOutMsg newProblem (refocus model.path newProblem model)

        ScratchDialogMsg scratchMsg ->
            case model.dialog of
                ScratchDialog scratchModel ->
                    case Dialog.Scratch.update scratchMsg scratchModel of
                        Dialog.Scratch.NoChangeOut ->
                            UnchangedOutMsg

                        Dialog.Scratch.ChangedOut newModel ->
                            ModelChangedOutMsg
                                { model | dialog = ScratchDialog newModel }

                        Dialog.Scratch.ChangedCmdOut newModel cmd ->
                            ModelCmdChangedOutMsg
                                { model | dialog = ScratchDialog newModel }
                                (Cmd.map ScratchDialogMsg cmd)

                        Dialog.Scratch.ExitOut ->
                            ModelChangedOutMsg { model | dialog = NoDialog }

                        Dialog.Scratch.AddOut newTerm ->
                            let
                                newProblem =
                                    -- { problem | scratch = newTerm :: List.filter (\t -> t /= newTerm) problem.scratch }
                                    -- { problem | scratch = problem.scratch ++ [ newTerm ] }
                                    { problem | scratch = List.filter (\t -> t /= newTerm) problem.scratch ++ [ newTerm ] }

                                newModel =
                                    { model | dialog = NoDialog }
                            in
                                ProblemChangedOutMsg newProblem (refocus model.path newProblem newModel)

                _ ->
                    Debug.crash "impossible"

        TransformationDialogMsg subMsg ->
            case model.dialog of
                TransformationDialog subModel ->
                    case Dialog.Transformation.update subMsg subModel of
                        Dialog.Transformation.EmptyOut ->
                            UnchangedOutMsg

                        Dialog.Transformation.ChangedOut newModel ->
                            ModelChangedOutMsg { model | dialog = TransformationDialog newModel }

                        Dialog.Transformation.CancelOut ->
                            ModelChangedOutMsg { model | dialog = NoDialog, transformationSelection = Nothing }

                        Dialog.Transformation.OkOut transformation newFocus ->
                            let
                                term =
                                    termReplace model.path newFocus model.term

                                newProblem =
                                    case model.direction of
                                        History ->
                                            { problem
                                                | history =
                                                    { term = term
                                                    , rule = transformation.ruleIndex
                                                    , isReversed = transformation.isReversed
                                                    }
                                                        :: List.drop model.historyIndex problem.history
                                            }

                                        Future ->
                                            { problem
                                                | future =
                                                    { term = term
                                                    , rule = transformation.ruleIndex
                                                    , isReversed = transformation.isReversed
                                                    }
                                                        :: List.drop model.futureIndex problem.future
                                            }

                                newModel1 =
                                    case model.direction of
                                        History ->
                                            { model | historyIndex = 0 }

                                        Future ->
                                            { model | futureIndex = 0 }

                                newModel2 =
                                    refocus model.path newProblem { newModel1 | dialog = NoDialog }
                            in
                                ProblemChangedOutMsg newProblem newModel2

                _ ->
                    Debug.crash "impossible"

        ScratchItemMsg idx ->
            if model.scratchSelection == Just idx then
                ModelChangedOutMsg { model | scratchSelection = Nothing }
            else
                ModelChangedOutMsg { model | scratchSelection = Just idx }

        ContextItemMsg idx ->
            if model.contextSelection == Just idx then
                ModelChangedOutMsg { model | contextSelection = Nothing }
            else
                ModelChangedOutMsg { model | contextSelection = Just idx }

        TransformationItemMsg idx ->
            if model.transformationSelection == Just idx then
                ModelChangedOutMsg { model | transformationSelection = Nothing }
            else
                ModelChangedOutMsg { model | transformationSelection = Just idx }

        TransformationUseMsg ->
            let
                sub =
                    currentTransformation model

                rule =
                    unsafeGet sub.ruleIndex problem.rules
            in
                if sub.isMultiple then
                    ModelCmdChangedOutMsg
                        { model
                            | dialog =
                                TransformationDialog
                                    (Dialog.Transformation.init model.focus
                                        (List.map .term model.context)
                                        problem.scratch
                                        (Rule.reverseIf sub.isReversed rule)
                                        sub
                                    )
                        }
                        (scrollToTopCmd IgnoreMsg)
                else
                    let
                        term =
                            termReplace model.path sub.display model.term

                        newProblem =
                            case model.direction of
                                History ->
                                    { problem
                                        | history =
                                            { term = term
                                            , rule = sub.ruleIndex
                                            , isReversed = sub.isReversed
                                            }
                                                :: List.drop model.historyIndex problem.history
                                    }

                                Future ->
                                    { problem
                                        | future =
                                            { term = term
                                            , rule = sub.ruleIndex
                                            , isReversed = sub.isReversed
                                            }
                                                :: List.drop model.futureIndex problem.future
                                    }

                        newModel1 =
                            case model.direction of
                                History ->
                                    { model | historyIndex = 0 }

                                Future ->
                                    { model | futureIndex = 0 }

                        newModel2 =
                            refocus model.path newProblem newModel1
                    in
                        ProblemChangedOutMsg newProblem newModel2

        ChangeDirectionMsg ->
            ModelChangedOutMsg
                (refocus (flippedPath model)
                    problem
                    { model
                        | direction = flipDirection model.direction
                        , transformationSelection = Nothing
                        , contextSelection = Nothing
                    }
                )

        HistoryItemMsg idx ->
            case model.direction of
                History ->
                    if idx == model.historyIndex then
                        UnchangedOutMsg
                    else
                        ModelChangedOutMsg (refocus [] problem { model | historyIndex = idx })

                Future ->
                    if idx == model.futureIndex then
                        UnchangedOutMsg
                    else
                        ModelChangedOutMsg (refocus [] problem { model | futureIndex = idx })

        SettingsShowProofMsg ->
            ShowProofOutMsg

        TransformationUndoMsg ->
            case model.direction of
                History ->
                    ModelChangedOutMsg (refocus [] problem { model | historyIndex = model.historyIndex + 1 })

                Future ->
                    ModelChangedOutMsg (refocus [] problem { model | futureIndex = model.futureIndex + 1 })

        TransformationRedoMsg ->
            case model.direction of
                History ->
                    ModelChangedOutMsg (refocus [] problem { model | historyIndex = model.historyIndex - 1 })

                Future ->
                    ModelChangedOutMsg (refocus [] problem { model | futureIndex = model.futureIndex - 1 })


flipDirection : Direction -> Direction
flipDirection d =
    case d of
        History ->
            Future

        Future ->
            History


flippedPath : Model -> Path
flippedPath model =
    case model.direction of
        History ->
            model.futurePath

        Future ->
            model.historyPath


refocus : Path -> Problem -> Model -> Model
refocus path problem model =
    let
        ( historyPath, futurePath ) =
            case model.direction of
                History ->
                    ( path, model.futurePath )

                Future ->
                    ( model.historyPath, path )

        term =
            currentTerm model.direction problem model

        focus =
            termFocus path term

        context =
            List.reverse (pushNestedContext path term [] [])

        transformations =
            Transformations.transformations problem.rules problem.scratch (List.map .term context) focus

        solved =
            currentTerm History problem model == currentTerm Future problem model
    in
        { model
            | historyPath = historyPath
            , futurePath = futurePath
            , term = term
            , focus = focus
            , context = context
            , path = path
            , transformations = transformations
            , solved = solved
            , scratchSelection = Nothing
            , contextSelection = Nothing
            , transformationSelection = Nothing
        }


currentTerm : Direction -> Problem -> Model -> Term
currentTerm direction problem model =
    case direction of
        History ->
            case List.drop model.historyIndex problem.history of
                [] ->
                    problem.start

                t :: _ ->
                    t.term

        Future ->
            case List.drop model.futureIndex problem.future of
                [] ->
                    problem.finish

                t :: _ ->
                    t.term


pushNestedContext : Path -> Term -> Path -> List { path : Path, term : Term } -> List { path : Path, term : Term }
pushNestedContext path term pathR ctx =
    case path of
        [] ->
            ctx

        GoLeft :: path2 ->
            case term of
                Binary Conjunction t1 t2 ->
                    pushNestedContext path2 t1 (GoLeft :: pathR) (pushContextLeft (GoRight :: pathR) t2 ctx)

                Binary Disjunction t1 _ ->
                    pushNestedContext path2 t1 (GoLeft :: pathR) ctx

                Binary Equivalence t1 _ ->
                    pushNestedContext path2 t1 (GoLeft :: pathR) ctx

                Binary Implication t1 _ ->
                    pushNestedContext path2 t1 (GoLeft :: pathR) ctx

                Unary _ _ ->
                    Debug.crash "impossible"

                Atom _ ->
                    Debug.crash "impossible"

        GoRight :: path2 ->
            case term of
                Binary Conjunction t1 t2 ->
                    pushNestedContext path2 t2 (GoRight :: pathR) (pushContextRight (GoLeft :: pathR) t1 ctx)

                Binary Disjunction _ t2 ->
                    pushNestedContext path2 t2 (GoRight :: pathR) ctx

                Binary Equivalence t1 t2 ->
                    pushNestedContext path2 t2 (GoRight :: pathR) ctx

                Binary Implication t1 t2 ->
                    pushNestedContext path2 t2 (GoRight :: pathR) (pushContextRight (GoLeft :: pathR) t1 ctx)

                Unary Not t2 ->
                    pushNestedContext path2 t2 (GoRight :: pathR) ctx

                Atom _ ->
                    Debug.crash "impossible"


pushContextLeft : Path -> Term -> List { path : Path, term : Term } -> List { path : Path, term : Term }
pushContextLeft path term ctx =
    case term of
        -- Atom Top ->
        --     ctx
        Binary Conjunction t1 t2 ->
            pushContextLeft (GoLeft :: path) t1 (pushContextLeft (GoRight :: path) t2 ctx)

        _ ->
            { path = List.reverse path, term = term } :: (List.filter (\x -> x.term /= term) ctx)


pushContextRight : Path -> Term -> List { path : Path, term : Term } -> List { path : Path, term : Term }
pushContextRight path term ctx =
    case term of
        -- Atom Top ->
        --     ctx
        Binary Conjunction t1 t2 ->
            pushContextRight (GoRight :: path) t2 (pushContextRight (GoLeft :: path) t1 ctx)

        _ ->
            { path = List.reverse path, term = term } :: (List.filter (\x -> x.term /= term) ctx)


termFocus : Path -> Term -> Term
termFocus path term =
    case path of
        [] ->
            term

        GoLeft :: path2 ->
            case term of
                Binary _ t1 _ ->
                    termFocus path2 t1

                Unary _ _ ->
                    Debug.crash "impossible"

                Atom _ ->
                    Debug.crash "impossible"

        GoRight :: path2 ->
            case term of
                Binary _ _ t2 ->
                    termFocus path2 t2

                Unary _ t2 ->
                    termFocus path2 t2

                Atom _ ->
                    Debug.crash "impossible"


transformationIsMultiple : Model -> Bool
transformationIsMultiple model =
    case model.transformationSelection of
        Nothing ->
            False

        Just idx ->
            (Utilities.unsafeGet idx model.transformations).isMultiple


currentTransformation : Model -> Transformation
currentTransformation model =
    case model.transformationSelection of
        Nothing ->
            Debug.crash "impossible"

        Just idx ->
            Utilities.unsafeGet idx model.transformations


termReplace : Path -> Term -> Term -> Term
termReplace path new term =
    case path of
        [] ->
            new

        GoLeft :: path2 ->
            case term of
                Binary b t1 t2 ->
                    Binary b (termReplace path2 new t1) t2

                Unary _ _ ->
                    Debug.crash "impossible"

                Atom _ ->
                    Debug.crash "impossible"

        GoRight :: path2 ->
            case term of
                Binary b t1 t2 ->
                    Binary b t1 (termReplace path2 new t2)

                Unary u t2 ->
                    Unary u (termReplace path2 new t2)

                Atom _ ->
                    Debug.crash "impossible"


scrollingCmd : Model -> Cmd Msg
scrollingCmd model =
    case model.dialog of
        NoDialog ->
            case model.panel of
                NotesPanel ->
                    scrollToTopCmd IgnoreMsg

                ContextPanel ->
                    scrollToTopCmd IgnoreMsg

                ScratchPanel ->
                    scrollToTopCmd IgnoreMsg

                TransformationsPanel ->
                    scrollToTopCmd IgnoreMsg

                HistoryPanel ->
                    case model.direction of
                        History ->
                            scrollToBottomCmd IgnoreMsg

                        Future ->
                            scrollToTopCmd IgnoreMsg

                RulesPanel ->
                    scrollToTopCmd IgnoreMsg

        TransformationDialog _ ->
            scrollToTopCmd IgnoreMsg

        ScratchDialog _ ->
            scrollToTopCmd IgnoreMsg


transformedTerm : Model -> Term
transformedTerm model =
    if isNothing model.transformationSelection || model.panel /= TransformationsPanel then
        model.term
    else
        termReplace model.path (currentTransformation model).display model.term


proofSteps : Problem -> Model -> List Step
proofSteps problem model =
    List.foldl historyStep [] (List.drop model.historyIndex problem.history)
        ++ futureStep problem.finish (List.drop model.futureIndex problem.future)


historyStep : Step -> List Step -> List Step
historyStep x r =
    x :: r


futureStep : Term -> List Step -> List Step
futureStep t xs =
    case xs of
        [] ->
            []

        [ x1 ] ->
            [ { rule = x1.rule, isReversed = x1.isReversed, term = t } ]

        x1 :: x2 :: r ->
            { rule = x1.rule, isReversed = x1.isReversed, term = x2.term } :: futureStep t (x2 :: r)


modelAriaHidden : Model -> Html.Attribute msg
modelAriaHidden model =
    case model.popUp of
        NoPopUp ->
            ariaHidden False

        _ ->
            ariaHidden True
