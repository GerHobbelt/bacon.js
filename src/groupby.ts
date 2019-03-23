import "./concat";
import { filterT } from "./filter";
import { mapT } from "./map";
import once from "./once";
import Observable, { EventStream } from "./observable";
import _ from "./_";
import { Event } from "./event"
import { EventSink } from "./types";
import { composeT } from "./transform";

export type GroupLimiter<V> = (data: EventStream<V>, firstValue: V) => Observable<V>

/** @hidden */
interface StreamMap<V> {
  [key: string]: EventStream<V>
}

/** @hidden */
export function groupBy<V>(src: Observable<V>, keyF: (value: V) => string, limitF: GroupLimiter<V> = _.id): Observable<EventStream<V>> {
  var streams: StreamMap<V> = {};
  return src.transform(composeT(
    filterT((x: V) => !streams[keyF(x)]),
    mapT(function(firstValue: V) {
      var key: string = keyF(firstValue)
      var similarValues: Observable<V> = src.changes().filter(x => keyF(x) === key )
      var data: EventStream<V> = once(firstValue).concat(similarValues)
      var limited = limitF(data, firstValue).toEventStream().transform((event: Event<V>, sink: EventSink<V>) => {
        let reply = sink(event)
        if (event.isEnd) {
          delete streams[key];
        }
        return reply
      })
      streams[key] = limited;
      return limited;
    })
  ))
}
