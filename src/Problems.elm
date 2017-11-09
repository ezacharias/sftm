module Problems exposing (problems)

import Term exposing (..)
import Problem exposing (..)
import Html exposing (Html)
import Html.Attributes
import Symbol exposing (Symbol)
import Render
import Graphics
import Rules exposing (..)


problems : List StaticProblem
problems =
    [ { description = "Use identity for conjunction."
      , notes =
            [ Html.p []
                [ Html.text "Your task is to transform the "
                , Render.latinUpperAHtml
                , Html.text " at the top of the screen into "
                , Binary Conjunction (Atom VarA) (Atom Top) |> Render.termSpan
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "Click the word Notes and then click Transformations. There is only one possible transformation. Click it and then click Apply."
                ]
            , Html.p []
                [ Html.text "A "
                , Graphics.lowerWhiteTombstone
                , Html.text " shape should appear at the top-left of the screen to show you’ve solved the problem. Click it to go on to the next one."
                ]
            , Html.p []
                [ Html.text "If something goes wrong you can use the undo and redo buttons in the transformations panel. You can also completely reset the problem from the menu at the top-right of the screen."
                ]
            ]
      , start = (Atom VarA)
      , finish = Binary Conjunction (Atom VarA) (Atom Top)
      , rules =
            [ identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use identity for conjunction in the other direction."
      , notes =
            [ Html.p []
                [ Html.text "This problem is the reverse of the previous one. The initial formula is "
                , Binary Conjunction (Atom VarA) (Atom Top) |> Render.termSpan
                , Html.text " and the goal is "
                , Render.latinUpperAHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "There are now two possible transformations in the transformation panel. Figure out which one to apply to solve the problem."
                ]
            , Html.p []
                [ Html.text "I’ll explain what some of these symbols mean."
                ]
            , Html.p []
                [ Render.latinUpperAHtml
                , Html.text " is a "
                , Html.em [] [ Html.text "variable" ]
                , Html.text ". Rather than standing for a number as in algebra, it stands for a logical value such as true or false."
                ]
            , Html.p []
                [ Html.text "The "
                , Render.conjunctionHtml
                , Html.text " symbol is called "
                , Html.em [] [ Html.text "conjunction" ]
                , Html.text " or "
                , Html.em [] [ Html.text "logical-and" ]
                , Html.text ". For a conjunction to be true, the expressions on both the left and the right must be true. If either the left or right is false, the conjunction is false."
                ]
            , Html.p []
                [ Render.topHtml
                , Html.text " is the symbol "
                , Html.em [] [ Html.text "true" ]
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "The initial formula can be read out loud as, “A and true”."
                ]
            , Html.p []
                [ Html.text "The behavior of these symbols is defined by rules shown in the rules panel. Later I will describe how to read rules."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Atom Top)
      , finish = (Atom VarA)
      , rules =
            [ identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use identity for conjunction twice."
      , notes =
            [ Html.p []
                [ Html.text "To solve this problem, you must apply a transformation twice."
                ]
            , Html.p []
                [ Html.text "See the "
                , Graphics.lowerArrow
                , Html.text " at the right of the screen? Click it and it will show you the goal formula. Click again and it will take you back to the initial formula. You can work from the initial formula towards the goal or from the goal towards the initial formula."
                ]
            ]
      , start = Binary Conjunction (Binary Conjunction (Atom VarA) (Atom Top)) (Atom Top)
      , finish = (Atom VarA)
      , rules =
            [ identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use navigation."
      , notes =
            [ Html.p []
                [ Html.text "This problem is the same as the previous one except the parentheses have moved. To solve it you need to learn how to navigate."
                ]
            , Html.p []
                [ Html.text "See the dots below the formula? Clicking on them lets you navigate to different parts of the formula. As you navigate, the "
                , Html.em [] [ Html.text "focus" ]
                , Html.text " will change."
                ]
            , Html.p []
                [ Html.text "Figure out where you need to apply transformations to solve the problem."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Conjunction (Atom Top) (Atom Top))
      , finish = (Atom VarA)
      , rules =
            [ identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use implosion."
      , notes =
            [ Html.p []
                [ Html.text "This problem introduces a new rule called implosion. It can be found in the rules panel."
                ]
            , Html.p []
                [ Html.text "In the initial formula, the variable "
                , Render.latinUpperAHtml
                , Html.text " is repeated. You can eliminate this repetition by replacing one of the "
                , Render.latinUpperAHtml
                , Html.text "s with "
                , Render.topHtml
                , Html.text ". In a later problem, you will go on to remove the "
                , Render.topHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "At any given focus, the expressions which can be replaced by "
                , Render.topHtml
                , Html.text " are called the "
                , Html.em [] [ Html.text "context " ]
                , Html.text ". These are shown in the context panel."
                ]
            , Html.p []
                [ Html.text "There are two rules for what expressions are added to the context. First, if you are on one side of a conjunction, the other side is added. Second, if the expression being added to the context is a conjunction, the left and right sides are individually added instead of the entire conjunction. If either the left or right is itself a conjunction, it is broken up as well, and so on."
                ]
            , Html.p []
                [ Html.text "Navigating around while looking at the context panel should help you get a feel for these rules. Clicking on an expression in the context panel will highlight that expression in the formula."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Atom VarA)
      , finish = Binary Conjunction (Atom VarA) (Atom Top)
      , rules =
            [ implosionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use implosion in the other direction."
      , notes =
            [ Html.p []
                [ Html.text "This time you’re going to use the implosion rule to replace "
                , Render.topHtml
                , Html.text " with "
                , Render.latinUpperAHtml
                , Html.text ". It’s not called the explosion rule when used this way. There’s another rule called the explosion rule which you will encounter later."
                ]
            , Html.p []
                [ Html.text "When you focus on "
                , Render.topHtml
                , Html.text " only  "
                , Render.latinUpperAHtml
                , Html.text " is in the context, so "
                , Render.latinUpperAHtml
                , Html.text " will automatically be used by the rule. If there is more than one expression in the context, you will be given a choice of which expression to use."
                ]
            , Html.p []
                [ Html.text "Now that you’ve seen a few rules, I’ll explain how to read them. Here’s implosion:" ]
            , Html.p [ Html.Attributes.class "center-text" ]
                [ implosionRule |> Render.ruleSpan
                ]
            , Html.p []
                [ Html.text "The "
                , Render.turnstileHtml
                , Html.text " symbol is called the "
                , Html.em [] [ Html.text "turnstile" ]
                , Html.text ". If there is something to the left of the turnstile, it must be in the context for the rule to match."
                ]
            , Html.p []
                [ Html.text "The "
                , Render.longLeftRightArrowHtml
                , Html.text " symbol means the rule can replace the pattern on the left with the pattern on the right."
                ]
            , Html.p []
                [ Render.frakturAHtml
                , Html.text " (a traditional German letter A) is a "
                , Html.em [] [ Html.text "metavariable" ]
                , Html.text ". It can match anything."
                ]
            , Html.p []
                [ Html.text "You have already seen "
                , Render.topHtml
                , Html.text ". In a rule, "
                , Render.topHtml
                , Html.text " only matches "
                , Render.topHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "The implosion rule can be read out loud as, “if something is in the context, you can replace it with true”."
                ]
            , Html.p []
                [ Html.text "Rules can match in either direction. Every rule which matches at the current focus is listed in the transformations panel."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Atom Top)
      , finish = Binary Conjunction (Atom VarA) (Atom VarA)
      , rules =
            [ implosionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Use implosion with two options."
      , notes =
            [ Html.p []
                [ Html.text "If there is more than one expression in the context, the implosion transformation will give you a choice of which expression to use to replace "
                , Render.topHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "When you navigate to "
                , Render.topHtml
                , Html.text ", "
                , Render.latinUpperAHtml
                , Html.text " and "
                , Render.latinUpperBHtml
                , Html.text " are added to the context individually rather than the entire expression "
                , Binary Conjunction (Atom VarA) (Atom VarB) |> Render.termSpan
                , Html.text "."
                ]
            ]
      , start = Binary Conjunction (Binary Conjunction (Atom VarA) (Atom VarB)) (Atom Top)
      , finish = Binary Conjunction (Binary Conjunction (Atom VarA) (Atom VarB)) (Atom VarB)
      , rules =
            [ implosionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols1
      }
    , { description = "Prove idempotency for conjunction."
      , notes =
            [ Html.p []
                [ Html.text "Time for your first proof."
                ]
            , Html.p []
                [ Html.text "You will prove a basic property of conjunction using the two rules you’ve encountered. This property is called "
                , Html.em [] [ Html.text "idempotency" ]
                , Html.text ", which means if you have the same expression on both sides of a conjunction, you can replace the conjunction with one copy of the expression."
                ]
            , Html.p []
                [ Html.text "Every transformation you apply shows up as a step in the history panel. If you want to undo a transformation, you can either use the undo button at the top of the transformations panel or go to the history panel and click on a previous step."
                ]
            , Html.p []
                [ Html.text "If you switch to the goal formula, the history panel becomes the future panel and shows you any transformations you apply working from the goal backwards."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Atom VarA)
      , finish = (Atom VarA)
      , rules =
            [ implosionRule
            , identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Prove left identity for conjunction."
      , notes =
            [ Html.p []
                [ Html.text "Your task is to add "
                , Render.topHtml
                , Html.text " to the left of "
                , Render.latinUpperAHtml
                , Html.text ". This is similar to what the identity rule does, except the identity rule adds "
                , Render.topHtml
                , Html.text " to to the right of an expression instead of the left."
                ]
            , Html.p []
                [ Html.text "Once you’ve solved a problem and clicked "
                , Graphics.lowerWhiteTombstone
                , Html.text ", you can go back to the problem and review the steps you took by selecting Show proof from the menu at the top-right of the screen."
                ]
            ]
      , start = (Atom VarA)
      , finish = Binary Conjunction (Atom Top) (Atom VarA)
      , rules =
            [ implosionRule
            , identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols1
      }
    , { description = "Prove commutativity for conjunction."
      , notes =
            [ Html.p []
                [ Html.text "You may have already encountered commutativity when learning algebra. It’s usually given as a basic law. Here you will prove it using the rules you’ve been given."
                ]
            , Html.p []
                [ Html.text "After this problem, commutativity for conjunction will be added to your set of rules."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Atom VarB)
      , finish = Binary Conjunction (Atom VarB) (Atom VarA)
      , rules =
            [ implosionRule
            , identityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols1
      }
    , { description = "Prove associativity for conjunction."
      , notes =
            [ Html.p []
                [ Html.text "If you were already familiar commutativity, you probably guessed associativity would be next." ]
            , Html.p []
                [ Html.text "Are you getting used to looking at the context panel? It should come in handy here."
                ]
            , Html.p []
                [ Html.text "After this problem, you will be given associativity for conjunction to use directly."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Conjunction (Atom VarB) (Atom VarC))
      , finish = Binary Conjunction (Binary Conjunction (Atom VarA) (Atom VarB)) (Atom VarC)
      , rules =
            [ implosionRule
            , identityForConjunctionRule
            , commutativityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: Symbol.VarC :: symbols1
      }
    , { description = "Use explosion."
      , notes =
            [ Html.p []
                [ Html.text "The initial formula contains "
                , Render.botHtml
                , Html.text ", which is the symbol "
                , Html.em [] [ Html.text "false" ]
                , Html.text ". It is a flipped over "
                , Render.topHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "The first rule which uses "
                , Render.botHtml
                , Html.text " is the explosion rule:"
                ]
            , Html.p [ Html.Attributes.class "center-text" ]
                [ explosionRule |> Render.ruleSpan
                ]
            , Html.p []
                [ Html.text "It can be read out loud as, “if false is in the context, you can replace true with anything”."
                ]
            , Html.p []
                [ Html.text "Here you will use explosion in a way similar to how implosion is used: to replace "
                , Render.latinUpperAHtml
                , Html.text " with "
                , Render.topHtml
                , Html.text ". In the next problem, you will discover what makes the explosion rule unique."
                ]
            ]
      , start = Binary Conjunction (Atom Bot) (Atom VarA)
      , finish = Binary Conjunction (Atom Bot) (Atom Top)
      , rules =
            [ explosionRule
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Use explosion in the other direction."
      , notes =
            [ Html.p []
                [ Html.text "When "
                , Render.botHtml
                , Html.text " is in the context, the explosion rule can replace "
                , Render.topHtml
                , Html.text " with anything. So how does the transformation decide what to use to replace "
                , Render.topHtml
                , Html.text "? It will ask you to choose from among expressions it finds in the scratch pad."
                ]
            , Html.p []
                [ Html.text "Currently, the scratch pad is empty. If you navigate to "
                , Render.topHtml
                , Html.text ", the explosion rule does not even show up in the transformations panel."
                ]
            , Html.p []
                [ Html.text "Let's add an expression. First, go to the scratch pad panel and click Add. Then click the "
                , Render.latinUpperAHtml
                , Html.text " symbol in the list and click OK to add it to the scratch pad."
                ]
            , Html.p []
                [ Html.text "If you want, you can play around with the scratch pad to build more complex expressions. You can always copy the current focus to the scratch pad by clicking Add and then clicking OK without selecting anything else."
                ]
            , Html.p []
                [ Html.text "Once at least one expression is in the scratch pad you should be able to use the explosion rule. A very common mistake when solving problems is to forget to add expressions to the scratch pad."
                ]
            ]
      , start = Binary Conjunction (Atom Bot) (Atom Top)
      , finish = Binary Conjunction (Atom Bot) (Atom VarA)
      , rules =
            [ explosionRule
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Prove annihilation for conjunction."
      , notes =
            [ Html.p []
                [ Render.botHtml
                , Html.text " is the annihilator for conjunction. This is because if "
                , Render.botHtml
                , Html.text " is one one side of a conjunction, it can annihilate whatever is on the other side, replacing the entire expression with "
                , Render.botHtml
                , Html.text "."
                ]
            , Html.p []
                [ Html.text "After this problem, you will be given annihilation for conjunction to use directly."
                ]
            ]
      , start = Binary Conjunction (Atom Bot) (Atom VarA)
      , finish = (Atom Bot)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , commutativityForConjunctionRule
            , associativityForConjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Demonstrate arbitrary transformation."
      , notes =
            [ Html.p []
                [ Render.botHtml
                , Html.text " can be used to transform anything into anything in a conjunction."
                ]
            , Html.p []
                [ Html.text "Remember to use the scratch pad."
                ]
            ]
      , start = Binary Conjunction (Atom Bot) (Atom VarA)
      , finish = Binary Conjunction (Atom Bot) (Atom VarB)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , commutativityForConjunctionRule
            , associativityForConjunctionRule
            , annihilationForConjunctionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Use identity for disjunction."
      , notes =
            [ Html.p []
                [ Html.text "In the the initial formula, the "
                , Render.disjunctionHtml
                , Html.text " symbol is called "
                , Html.em [] [ Html.text "disjunction" ]
                , Html.text " or "
                , Html.em [] [ Html.text "logical-or" ]
                , Html.text ". For it to be true, either the left side, the right side, or both the left and right side must be true. For it to be false, both the left and right side must be false."
                ]
            , Html.p []
                [ Html.text "While the identity for conjunction is "
                , Render.topHtml
                , Html.text ", the identity for disjunction is "
                , Render.botHtml
                , Html.text "."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Atom Bot)
      , finish = (Atom VarA)
      , rules =
            [ identityForDisjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Use annihilation for disjunction."
      , notes =
            [ Html.p []
                [ Render.topHtml
                , Html.text " is the annihilator for disjunction."
                ]
            ]
      , start = Binary Disjunction (Atom Top) (Atom VarA)
      , finish = (Atom Top)
      , rules =
            [ annihilationForDisjunctionRule
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Use commutativity for disjunction."
      , notes =
            [ Html.p []
                [ Html.text "Commutativity works exactly the same as for conjunction."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Atom VarB)
      , finish = Binary Disjunction (Atom VarB) (Atom VarA)
      , rules =
            [ commutativityForDisjunctionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Use distribution of conjunction over disjunction."
      , notes =
            [ Html.p []
                [ Html.text "The distribution rule is similar to distribution of multiplication over addition in algebra."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Disjunction (Atom VarB) (Atom VarC))
      , finish = Binary Disjunction (Binary Conjunction (Atom VarA) (Atom VarB)) (Binary Conjunction (Atom VarA) (Atom VarC))
      , rules =
            [ distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Prove idempotency for disjunction."
      , notes =
            [ Html.p []
                [ Html.text "Disjunction adds expressions to the context differently from conjunction in two important ways. First, if you are on one side of a disjunction, the other side is not added to the context. Second, if an entire disjunction is added to the context, it is not broken up."
                ]
            , Html.p []
                [ Html.text "Because disjunction uses the context in a more limited way, proofs involving disjunction tend to be more complex and challenging than proofs involving conjunction alone."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Atom VarA)
      , finish = (Atom VarA)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: symbols3
      }
    , { description = "Prove absorption for conjunction."
      , notes =
            [ Html.p [] [ Html.text "This is a proof which helps show how conjunction and disjunction relate to one-another." ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Disjunction (Atom VarA) (Atom VarB))
      , finish = (Atom VarA)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Prove absorption for disjunction."
      , notes =
            [ Html.p []
                [ Html.text "This is the same as the previous problem, except the conjunction and disjunction operators have been exchanged."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Binary Conjunction (Atom VarA) (Atom VarB))
      , finish = (Atom VarA)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Relate both absorptions."
      , notes =
            [ Html.p []
                [ Html.text "Here you will go directly from the initial formula of absorption for conjunction to the initial formula of absorption for disjunction."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Disjunction (Atom VarA) (Atom VarB))
      , finish = Binary Disjunction (Atom VarA) (Binary Conjunction (Atom VarA) (Atom VarB))
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Demonstrate absorption with association."
      , notes =
            [ Html.p []
                [ Html.text "This is an absorption problem where "
                , Binary Disjunction (Atom VarA) (Atom VarB) |> Render.termSpan
                , Html.text " must absorb "
                , Render.latinUpperCHtml
                , Html.text ". However, the parenthesis on the right-hand side surround "
                , Binary Disjunction (Atom VarB) (Atom VarC) |> Render.termSpan
                , Html.text " rather than "
                , Binary Disjunction (Atom VarA) (Atom VarB) |> Render.termSpan
                , Html.text "."
                ]
            ]
      , start =
            Binary
                Conjunction
                (Binary Disjunction (Atom VarA) (Atom VarB))
                (Binary Disjunction (Atom VarA) (Binary Disjunction (Atom VarB) (Atom VarC)))
      , finish = Binary Disjunction (Atom VarA) (Atom VarB)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: Symbol.VarC :: symbols3
      }
    , { description = "Prove associativity for disjunction."
      , notes =
            [ Html.p []
                [ Html.text "If you have trouble with this proof, try solving the previous four absorption problems from the goal backwards."
                ]
            , Html.p []
                [ Html.text "After this problem, you will be given associativity for disjunction to use directly."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Binary Disjunction (Atom VarB) (Atom VarC))
      , finish = Binary Disjunction (Binary Disjunction (Atom VarA) (Atom VarB)) (Atom VarC)
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: Symbol.VarC :: symbols3
      }
    , { description = "Prove distribution of disjunction over conjunction."
      , notes =
            [ Html.p []
                [ Html.text "You already have distribution of conjunction over disjunction."
                ]
            , Html.p []
                [ Html.text "If you turn your phone sideways (landscape mode), you can view long formulas more easily."
                ]
            , Html.p []
                [ Html.text "After this problem, you will be given distribution of disjunction over conjunction to use directly."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Binary Conjunction (Atom VarB) (Atom VarC))
      , finish = Binary Conjunction (Binary Disjunction (Atom VarA) (Atom VarB)) (Binary Disjunction (Atom VarA) (Atom VarC))
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: Symbol.VarC :: symbols3
      }
    , { description = "Prove disjunction is inclusive."
      , notes =
            [ Html.p []
                [ Html.text "Hint: Try working from the goal backwards."
                ]
            ]
      , start = Binary Disjunction (Atom VarA) (Atom VarB)
      , finish = Binary Disjunction (Binary Disjunction (Atom VarA) (Atom VarB)) (Binary Conjunction (Atom VarA) (Atom VarB))
      , rules =
            [ implosionRule
            , explosionRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfDisjunctionOverConjunction
            , distributionOfConjunctionOverDisjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols3
      }
    , { description = "Use reflexivity for equivalence."
      , notes =
            [ Html.p []
                [ Html.text "In the goal formula, the "
                , Render.equivalenceHtml
                , Html.text " symbol is called "
                , Html.em [] [ Html.text "equivalence" ]
                , Html.text ". It is a shorter version of the arrow used in the rules. An equivalence is true if there’s some way to transform the left side into the right side, and the other way around. It is false if this is impossible."
                ]
            , Html.p []
                [ Html.text "Here is the reflexivity rule:"
                ]
            , Html.p [ Html.Attributes.class "center-text" ]
                [ reflexivityForEquivalenceRule |> Render.ruleSpan
                ]
            , Html.p []
                [ Html.text "It works because any expression can be transformed into itself (no transformation is needed)."
                ]
            , Html.p []
                [ Html.text "Every problem you have solved has been a proof of an equivalence. That is, you have proven the initial formula is equivalent to (can be transformed into) the goal formula."
                ]
            , Html.p []
                [ Html.text "Don’t forget to add expressions to the scratch pad to make them available for reflexivity."
                ]
            ]
      , start = (Atom Top)
      , finish = Binary Equivalence (Atom VarA) (Atom VarA)
      , rules =
            [ reflexivityForEquivalenceRule
            ]
      , scratch = Symbol.VarA :: symbols4
      }
    , { description = "Use substitution."
      , notes =
            [ Html.p []
                [ Html.text "If an equivalence is in the context, you can use it to perform substitution."
                ]
            ]
      , start = Binary Conjunction (Binary Equivalence (Atom VarA) (Atom VarB)) (Atom VarA)
      , finish = Binary Conjunction (Binary Equivalence (Atom VarA) (Atom VarB)) (Atom VarB)
      , rules =
            [ substitutionRule
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    , { description = "Eliminate the equivalence."
      , notes =
            [ Html.p []
                [ Html.text "Equivalence adds expressions to the context similarly to disjunction. First, if you are on one side of an equivalence, the other side is not added to the context. Second, if an entire equivalence is added to the context, it is not broken up."
                ]
            ]
      , start = Binary Conjunction (Atom VarA) (Binary Equivalence (Atom VarA) (Atom VarB))
      , finish = Binary Conjunction (Atom VarA) (Atom VarB)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    , { description = "Prove true is not equivalent to false."
      , notes =
            [ Html.p []
                  [ Html.text "This proof shows it is not possible to transform true into false."
                  ]
            , Html.p []
                  [ Html.text "In a later problem you will discover what happens if the rules somehow make it possible to transform true into false."
                  ]
            ]
      , start = Binary Equivalence (Atom Top) (Atom Bot)
      , finish = (Atom Bot)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = symbols4
      }
    , { description = "Prove symmetry for equivalence."
      , notes =
            [ Html.p []
                [ Html.text "This is just commutativity. However, it’s rare to use the word commutativity for equivalence; the word symmetry is more common."
                ]
            , Html.p []
                [ Html.text "After this problem, you will be given symmetry for equivalence to use directly."
                ]
            ]
      , start = Binary Equivalence (Atom VarA) (Atom VarB)
      , finish = Binary Equivalence (Atom VarB) (Atom VarA)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    , { description = "Prove identity for equivalence."
      , notes =
            [ Html.p []
                [ Render.topHtml
                , Html.text " is the identity for equivalence."
                ]
            , Html.p []
                [ Html.text "Don’t forget to use the scratch pad."
                ]
            , Html.p []
                [ Html.text "After this problem, identity for equivalence will be added to your set of rules."
                ]
            ]
      , start = (Atom VarA)
      , finish = Binary Equivalence (Atom VarA) (Atom Top)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , identityForEquivalenceRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , symmetryForEquivalenceRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: symbols4
      }
    , { description = "Prove false is not the annihilator for equivalence."
      , notes =
            [ Html.p []
                [ Html.text "There is no annihilator for equivalence. However, a bad rule (annihilation for equivalence) has been added which treats "
                , Render.botHtml
                , Html.text " as the annihilator. You can prove the set of rules is now "
                , Html.em [] [ Html.text "inconsistent" ]
                , Html.text " by transforming "
                , Render.topHtml
                , Html.text " into "
                , Render.botHtml
                , Html.text "; that is, when this rule is added, true can be transformed into false, which is a "
                , Html.em [] [ Html.text "contradiction" ]
                , Html.text "."
                ]
            , Html.p [] [ Html.text "Don’t forget to use the scratch pad." ]
            , Html.p [] [ Html.text "Annihilation for equivalence is only used in this problem." ]
            ]
      , start = Atom Top
      , finish = Atom Bot
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , identityForEquivalenceRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , annihilationForEquivalenceRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , symmetryForEquivalenceRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: symbols4
      }
    , { description = "Prove a relationship between conjunction and disjunction."
      , notes =
            [ Html.p [] [ Html.text "This is a proof which helps show how conjunction and disjunction relate to one-another." ]
            ]
      , start = Binary Equivalence (Atom VarA) (Binary Conjunction (Atom VarA) (Atom VarB))
      , finish = Binary Equivalence (Atom VarB) (Binary Disjunction (Atom VarA) (Atom VarB))
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , identityForEquivalenceRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , symmetryForEquivalenceRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    , { description = "Prove another relationship between conjunction and disjunction."
      , notes =
            [ Html.p [] [ Html.text "This is another proof which helps show how conjunction and disjunction relate to one-another." ]
            ]
      , start = Binary Equivalence (Binary Conjunction (Atom VarA) (Atom VarB)) (Binary Disjunction (Atom VarA) (Atom VarB))
      , finish = Binary Equivalence (Atom VarA) (Atom VarB)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , identityForEquivalenceRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , symmetryForEquivalenceRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    , { description = "Express conjunction in terms of equivalence and disjunction."
      , notes =
            [ Html.p [] [ Html.text "This proof shows conjunction is no longer strictly necessary—it can be expressed in terms of disjunction and equivalence." ] ]
      , start = Binary Equivalence (Binary Equivalence (Atom VarA) (Atom VarB)) (Binary Disjunction (Atom VarA) (Atom VarB))
      , finish = Binary Conjunction (Atom VarA) (Atom VarB)
      , rules =
            [ implosionRule
            , explosionRule
            , substitutionRule
            , reflexivityForEquivalenceRule
            , identityForConjunctionRule
            , identityForDisjunctionRule
            , identityForEquivalenceRule
            , annihilationForConjunctionRule
            , annihilationForDisjunctionRule
            , commutativityForConjunctionRule
            , commutativityForDisjunctionRule
            , symmetryForEquivalenceRule
            , associativityForConjunctionRule
            , associativityForDisjunctionRule
            , distributionOfConjunctionOverDisjunction
            , distributionOfDisjunctionOverConjunction
            ]
      , scratch = Symbol.VarA :: Symbol.VarB :: symbols4
      }
    ]


symbols1 : List Symbol
symbols1 =
    [ Symbol.Top
    , Symbol.Conjunction
    ]


symbols2 : List Symbol
symbols2 =
    [ Symbol.Top
    , Symbol.Bot
    , Symbol.Conjunction
    ]


symbols3 : List Symbol
symbols3 =
    [ Symbol.Top
    , Symbol.Bot
    , Symbol.Conjunction
    , Symbol.Disjunction
    ]


symbols4 : List Symbol
symbols4 =
    [ Symbol.Top
    , Symbol.Bot
    , Symbol.Conjunction
    , Symbol.Disjunction
    , Symbol.Equivalence
    ]
