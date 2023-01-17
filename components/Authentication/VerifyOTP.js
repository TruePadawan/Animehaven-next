import { Typography, Button, TextField } from "@mui/material";
import { useState } from "react";
import useInterval from "../../hooks/use-interval";
import { supabase } from "../../supabase/config";

const VerifyOTP = ({ email, options, onVerify = null, errorHandler }) => {
	const [OTPValue, setOTPValue] = useState("");
	const [countdown, setCountdown] = useState(60);
	const [countdownIsRunning, setCountdownIsRunning] = useState(true);

	useInterval(
		() => {
			setCountdown((current) => {
				const newVal = current - 1 < 0 ? 60 : current - 1;
				if (newVal === 60) {
					setCountdownIsRunning(false);
				}
				return newVal;
			});
		},
		countdownIsRunning ? 1000 : null
	);

	const onOTPValueChange = (e) => setOTPValue(e.target.value);

	const requestOTP = async () => {
		if (countdownIsRunning) return;

		try {
			const { error } = await supabase.auth.signInWithOtp({ email });
			if (error) throw error;
			else {
				setCountdownIsRunning(true);
			}
		} catch (error) {
			errorHandler("OTP Request failed!", error);
		}
	};

	const handleVerification = async (event) => {
		event.preventDefault();
		try {
			const { error, data } = await supabase.auth.verifyOtp({
				email,
				type: options.verificationType,
				token: OTPValue,
			});
			if (error) throw error;
			else {
				if (onVerify !== null) {
					onVerify(data);
				}
			}
		} catch (error) {
			errorHandler("OTP Verification failed!", error);
		}
	};

	const disableRequestOTPBtn = countdownIsRunning === true;
	return (
		<form className="verify-otp-form" onSubmit={handleVerification}>
			<p className="fs-6">Check your Email for OTP</p>
			<TextField
				variant="filled"
				label="OTP"
				placeholder="123456"
				value={OTPValue}
				onChange={onOTPValueChange}
				required
			/>
			<Typography variant="caption" display="block">
				Request new OTP in <span className="text-primary">{countdown}</span>
			</Typography>
			<Button variant="contained" type="submit">
				Verify OTP
			</Button>
			<Button
				sx={{ "&:disabled": { color: "gray"} }}
				type="button"
				disabled={disableRequestOTPBtn}
				onClick={requestOTP}>
				Request new OTP
			</Button>
		</form>
	);
};
export default VerifyOTP;
