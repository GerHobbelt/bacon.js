import * as Bacon from "../..";
import { expect } from "chai";

import { expectStreamEvents, error, fromArray } from "./util/SpecHelper";

describe("EventStream.flatMapError", function() {
  describe("allows spawning a new stream from an error", () =>
    expectStreamEvents(
      function() {
        const source = fromArray([
          error(),
          error("1"),
          error(),
          error("2")
        ]);
        return source.flatMapError(function(err) {
          if (err != error().error) { // map all non-default errors to values
            return Bacon.once(err);
          } else {
            return error();
          }
        });
      },

      [error(), "1", error(), "2"]
    )
  );
  describe("has no effect on values", () =>
    expectStreamEvents(
      () => fromArray([1, 2]).flatMapError((_) => Bacon.once("omg")),
      [1, 2]
    )
  );
  return it("toString", () => expect(Bacon.once(1).flatMapError(function() {}).toString()).to.equal("Bacon.once(1).flatMapError(function)"));
});
