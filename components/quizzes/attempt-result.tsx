import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AttemptResult } from "@/lib/types";

export function AttemptResultView({
  result,
  onRetake,
}: {
  result: AttemptResult;
  onRetake?: () => void;
}) {
  const percent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Your score</p>
        <p className="text-4xl font-semibold tracking-tight">
          {result.score}
          <span className="text-2xl text-muted-foreground">
            {" "}
            / {result.total}
          </span>
        </p>
        <Progress value={percent} />
        <p className="text-sm text-muted-foreground">{percent}% correct</p>
      </div>

      <ol className="grid gap-3">
        {result.results.map((item, index) => (
          <li
            key={item.questionId}
            className="grid gap-3 rounded-xl border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-white",
                  item.isCorrect ? "bg-emerald-500" : "bg-destructive",
                )}
              >
                {item.isCorrect ? (
                  <CheckIcon className="size-3.5" aria-hidden="true" />
                ) : (
                  <XIcon className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="font-medium">
                {index + 1}. {item.prompt}
              </span>
            </div>

            <ul className="grid gap-1.5 pl-9">
              {item.options.map((option, optionIndex) => {
                const isCorrect = item.correctAnswerIndices.includes(
                  optionIndex,
                );
                const isSelected = item.selectedIndices.includes(optionIndex);
                return (
                  <li
                    key={optionIndex}
                    className={cn(
                      "flex flex-wrap items-center gap-2 rounded-md px-2 py-1 text-sm",
                      isCorrect && "bg-emerald-500/10",
                      isSelected && !isCorrect && "bg-destructive/10",
                    )}
                  >
                    <span>{option}</span>
                    {isCorrect ? (
                      <Badge variant="success">Correct</Badge>
                    ) : null}
                    {isSelected ? (
                      <Badge
                        variant={isCorrect ? "success" : "destructive"}
                      >
                        Your answer
                      </Badge>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {onRetake ? (
        <div className="flex justify-center">
          <Button onClick={onRetake}>Retake quiz</Button>
        </div>
      ) : null}
    </div>
  );
}
