import React, { useCallback, useEffect, useState } from "react";

type UseInputOptions = {
  defaultValue?: string;
  customTransformation?: (value: string) => string;
};
const useInput = (
  validate: (value: string) => Promise<boolean>,
  options?: UseInputOptions,
) => {
  const [inputValue, setInputValue] = useState(options?.defaultValue ?? "");
  const [inputIsValid, setInputIsValid] = useState(false);
  const [inputHasError, setInputHasError] = useState(false);
  const [checkingValidity, setCheckingValidity] = useState(false);
  const [inputWasTouched, setInputWasTouched] = useState(false);

  const cachedValidator = useCallback(validate, []);

  useEffect(() => {
    setInputIsValid(false);
    setCheckingValidity(true);
    const timeoutID = setTimeout(() => {
      cachedValidator(inputValue)
        .then((isValid) => {
          setInputIsValid(isValid);
          setCheckingValidity(false);
        })
        .catch(() => {
          setCheckingValidity(false);
        });
    }, 600);
    return () => clearTimeout(timeoutID);
  }, [inputValue, cachedValidator]);

  useEffect(() => {
    if (!inputIsValid && inputWasTouched && !checkingValidity) {
      setInputHasError(true);
    } else if (inputIsValid && inputWasTouched && !checkingValidity) {
      setInputHasError(false);
    }
  }, [inputIsValid, inputWasTouched, checkingValidity]);

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (options?.customTransformation) {
      setInputValue(options.customTransformation(event.target.value));
    } else {
      setInputValue(event.target.value);
    }
  };

  const inputOnBlurHandler = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInputWasTouched(true);
  };

  const resetInput = () => {
    setInputValue("");
    setInputHasError(false);
    setInputWasTouched(false);
  };

  return {
    value: inputValue,
    isValid: inputIsValid,
    hasError: inputHasError,
    changeHandler: inputChangeHandler,
    blurHandler: inputOnBlurHandler,
    checkingValidity,
    resetInput,
  };
};

export default useInput;
