import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card border-2 border-[#ff781e]">
        <CardHeader className="relative text-[#ff781e]">
          <CardDescription>Reports Gesamt</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">
            1,250
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steigerung im letzten Monat <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Berichte für die letzten 6 Monate
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-2 border-[#ff781e]">
        <CardHeader className="relative text-[#ff781e]">
          <CardDescription>Häufigste Meldung</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            Strassenbeschädigung
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +20%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Höher als letzter Monat <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Strassenbeschädigungen steigen
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-2 border-[#ff781e]">
        <CardHeader className="relative text-[#ff781e]">
          <CardDescription>Antwortzeit</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            24h
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              -15%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Schnellere Antworten <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Durchschnittliche Antwortzeit
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-2 border-[#ff781e]">
        <CardHeader className="relative text-[#ff781e]">
          <CardDescription>Erfolgsrate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            78.5%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +4.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steigerung im letzten Monat <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Berichte erfolgreich geschlossen
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
