import { ContextAction } from './enums/context-action.enum';
import { CurrentContextState } from './enums/context-state.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';

export class ActionButton {
  constructor(
    public nextContextAction: ContextAction | number,
    public currentContextState: CurrentContextState,
    public buttonContextClass: ButtonContextClass
  ) {}

  static changeContext(nextContextAction, currentContextState, buttonContextClass?): ActionButton {
    return new ActionButton(nextContextAction, currentContextState, buttonContextClass);
  }
}
