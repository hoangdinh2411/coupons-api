import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotEmptyDraftContent', async: false })
export class IsNotEmptyDraftContentConstraint
  implements ValidatorConstraintInterface
{
  validate(
    contentRaw: RawDraftContentState,
    _args: ValidationArguments,
  ): boolean {
    if (
      !contentRaw ||
      typeof contentRaw !== 'object' ||
      !Array.isArray(contentRaw.blocks)
    ) {
      return false;
    }

    return contentRaw.blocks.some(
      (block) => typeof block.text === 'string' && block.text.trim().length > 0,
    );
  }

  defaultMessage(): string {
    return 'Editor content must not be empty';
  }
}

export function IsNotEmptyDraftContent(validationOptions?: ValidationOptions) {
  return function (o: object, propertyName: string) {
    registerDecorator({
      target: o.constructor,
      propertyName,
      options: validationOptions,
      validator: IsNotEmptyDraftContentConstraint,
    });
  };
}

export interface RawDraftContentState {
  blocks: {
    key: string;
    type: string;
    text: string;
    depth: number;
    inlineStyleRanges: {
      style: string;
      offset: number;
      length: number;
    };
    entityRanges: {
      key: number;
      offset: number;
      length: number;
    }[];
    data?: { [key: string]: any } | undefined;
  }[];
  entityMap: {
    [key: string]: {
      type: string;
      mutability: string;
      data: any;
    };
  };
}
