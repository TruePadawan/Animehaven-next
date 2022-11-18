import { useEffect, useState } from "react";

const useInput = (validate, customTransformation = null) => {
	const [inputValue, setInputValue] = useState("");
	const [inputIsValid, setInputIsValid] = useState(false);
    const [inputHasError, setInputHasError] = useState(false);
	const [checkingValidity, setCheckingValidity] = useState(false);
    const [inputWasTouched, setInputWasTouched] = useState(false);

	useEffect(() => {
        setInputIsValid(false);
        setCheckingValidity(true);
		const timeoutID = setTimeout(() => {
			validate(inputValue)
				.then((isValid) => {
					if (isValid !== true && isValid !== false) {
						throw new Error("Validation callback must resolve to a boolean");
					}
					setInputIsValid(isValid);
					setCheckingValidity(false);
				})
				.catch((reason) => {
					console.log(reason);
					setCheckingValidity(false);
				});
		}, 600);
		return () => clearTimeout(timeoutID);
	}, [inputValue, validate]);

    useEffect(() => {
        if (!inputIsValid && inputWasTouched && !checkingValidity) {
            setInputHasError(true);
        } else if (inputIsValid && inputWasTouched && !checkingValidity) {
            setInputHasError(false);
        }
    }, [inputIsValid, inputWasTouched, checkingValidity]);

	const inputChangeHandler = (event) => {
		if (customTransformation === null) {
			setInputValue(event.target.value);
		} else {
			setInputValue(customTransformation(event.target.value));
		}
	};

    const inputOnBlurHandler = (event) => {
        setInputWasTouched(true);
    }

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
        resetInput
	};
};

export default useInput;
