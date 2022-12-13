import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useHistory } from "react-router-dom";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
	let [authTokens, setAuthTokens] = useState(() =>
		localStorage.getItem("authTokens")
			? JSON.parse(localStorage.getItem("authTokens"))
			: null
	);
	let [user, setUser] = useState(() =>
		localStorage.getItem("authTokens")
			? jwt_decode(localStorage.getItem("authTokens"))
			: null
	);

	let [loading, setLoading] = useState(true);

	const history = useHistory();

	let loginUser = async (e) => {
		e.preventDefault();

		let response = await fetch("http://127.0.0.1:8000/api/token/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: e.target.username.value,
				password: e.target.password.value,
			}),
		});

		let data = await response.json();

		if (response.status === 200) {
			setAuthTokens(data);
			setUser(jwt_decode(data.access));
			localStorage.setItem("authTokens", JSON.stringify(data));
			history.push("/");
		} else {
			alert("Invalid username or password");
		}
	};

	let logoutUser = () => {
		setAuthTokens(null);
		setUser(null);
		localStorage.removeItem("authTokens");
		history.push("/login");
	};

	let updateToken = async () => {
		console.log("Update Token Called");
		let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				refresh: authTokens.refresh,
			}),
		});

		let data = await response.json();

		if (response.status === 200) {
			setAuthTokens(data);
			setUser(jwt_decode(data.access));
			localStorage.setItem("authTokens", JSON.stringify(data));
		} else {
			logoutUser();
		}
	};

	let contextData = {
		user: user,
		loginUser: loginUser,
		logoutUser: logoutUser,
	};

	useEffect(() => {
		let fourMinutres = 1000 * 60 * 4;
		let interval = setInterval(() => {
			if (authTokens) {
				updateToken();
			}
		}, fourMinutres);
		return () => {
			clearInterval(interval);
		};
	}, [authTokens, loading]);

	return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
};

// export const AuthProvider = ({ children }) => {
//     const [authenticated, setAuthenticated] = useState(false);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             setAuthenticated(true);
//         }
//         setLoading(false);
//     }, []);

//     return (
//         <AuthContext.Provider
//             value={{
//                 authenticated,
//                 setAuthenticated,
//                 loading,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }
