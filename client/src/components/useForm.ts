import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { User } from "../models/User";
import { useSelector, useDispatch } from "react-redux";
import { updateStatus } from "../redux/status/actions";
import { updateUser } from "../redux/user/actions";
import { RootState } from "../redux/index";
import { useLoginMutation, useRegisterMutation } from "../generated/graphql";

export const useForm = (initState: User) => {
  const [values, setValues] = useState(initState);
  const [errors, setErrors] = useState<any>({});
  const [disable, setDisable] = useState(false);
  const { loggedIn } = useSelector((state: RootState) => {
    return {
      loggedIn: state.status.loggedIn,
    };
  });
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const noErrors = Object.keys(errors).length === 0;
    if (noErrors) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [errors, disable]);

  const checkIfLogin = (init: User) => {
    const login = { email: "", password: "" };
    if (JSON.stringify(login) === JSON.stringify(init)) {
      return true;
    } else {
      return false;
    }
  };
  const validate = () => {
    let error = {};
    const login = checkIfLogin(initState);
    if (!values.email) {
      Object.assign(error, { email: "Email cannot be empty" });
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      Object.assign(error, { email: "Invalid email address" });
    }
    if (!values.password) {
      Object.assign(error, { password: "Password cannot be empty" });
    } else if (values.password.length < 6) {
      Object.assign(error, {
        password: "Password must be at least 6 characters",
      });
    }
    if (!login) {
      if (!values.firstName) {
        Object.assign(error, { firstName: "First name cannot be empty" });
      } else if (values.firstName.length < 3) {
        Object.assign(error, {
          firstName: "First name must be at least 3 characters",
        });
      }
      if (!values.lastName) {
        Object.assign(error, { lastName: "Last name cannot be empty" });
      } else if (values.lastName.length < 3) {
        Object.assign(error, {
          lastName: "Last name must be at least 3 characters",
        });
      }
    }
    return error;
  };
  const validateUser = (errorMessage: string) => {
    let error = {};
    Object.assign(error, { email: errorMessage });
    return error;
  };
  const handleBlur = () => {
    const validation = validate();
    setErrors(validation);
  };
  const handleChange = (e: any) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
    const validation = validate();
    setErrors(validation);
  };
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    setDisable(true);
    await login({
      variables: {
        email: values.email,
        password: values.password,
      },
    })
      .then((res) => {
        if (res.data?.login) {
          const response = res.data.login.user;
          dispatch(
            updateUser({
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
            })
          );
          dispatch(updateStatus({ loggedIn: !loggedIn }));
          history.push("/myaccount");
        }
      })
      .catch(() => {
        const validation = validateUser("Invalid email or password");
        setErrors(validation);
      });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validate();
    setErrors(validation);
    setDisable(true);

    await register({
      variables: {
        email: values.email,
        password: values.password,
        firstName: values.firstName as string,
        lastName: values.lastName as string,
      },
    }).then((res) => {
      if (res.data?.register === true) {
        history.push("/login");
      } else {
        const validation = validateUser("Email Already Exists!");
        setErrors(validation);
      }
    });
  };
  return {
    handleChange,
    handleRegister,
    handleLogin,
    handleBlur,
    errors,
    disable,
    values,
  };
};
