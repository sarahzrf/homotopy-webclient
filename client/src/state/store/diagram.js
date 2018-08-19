import dotProp from "dot-prop-immutable";
import createReducer from "~/util/create-reducer";
import * as DiagramActions from "~/state/actions/diagram";
import * as SignatureActions from "~/state/actions/signature";
import * as Actions from "~/state/actions/diagram";
import * as Core from "homotopy-core";
import { createGenerator } from "~/state/store/signature";

export default createReducer({
  [DiagramActions.SET_SOURCE]: (state, {}) => {
    let { target, diagram } = state.diagram;

    if (diagram == null) {
      return state;
    } else if (target != null) {
      state = createGenerator(state, diagram, target);
      state = dotProp(state, `diagram.diagram`, null);
      state = dotProp(state, `diagram.target`, null);
      return state;
    } else {
      state = dotProp(state, `diagram.source`, diagram);
      state = dotProp(state, `diagram.diagram`, null);
      return state;
    }
  },

  [DiagramActions.SET_TARGET]: (state, {}) => {
    let { source, diagram } = state.diagram;

    if (diagram == null) {
      return state;
    } else if (source != null) {
      state = createGenerator(state, source, target);
      state = dotProp(state, `diagram.diagram`, null);
      state = dotProp(state, `diagram.source`, null);
      return state;
    } else {
      state = dotProp(state, `diagram.target`, diagram);
      state = dotProp(state, `diagram.diagram`, null);
      return state;
    }
  },

  [DiagramActions.CLEAR_DIAGRAM]: (state, {}) => {
    state = dotProp(state, `diagram.diagram`, null);
    return state;
  },

  [DiagramActions.TAKE_IDENTITY]: (state, {}) => {
    state = dotProp(state, `diagram.diagram`, diagram => diagram.copy().boost());
    return state;
  },

  [SignatureActions.SELECT_GENERATOR]: (state, { id }) => {
    let { diagram } = state.diagram;
    let generator = state.signature.generators[id];

    if (diagram == null) {
      state = dotProp.set(state, `diagram.diagram`, generator.generator.getDiagram());
      return state;
    } else {
      return state;
    }
  },
})