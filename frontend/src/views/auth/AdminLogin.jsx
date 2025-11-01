import React, { useEffect } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { admin_login, messageClear } from "../../store/Reducers/authReducer";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
const AdminLogin = () => {

  const navigate = useNavigate();
  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(admin_login(state));
    // console.log(state);
  };

  const overrideStyle = {
    display: "flex",
    margin: "0 auto",
    height: "24px",
    justifyContent: "center",
    alignItem: "center",
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate("/");
    }
  }, [errorMessage, successMessage]);

  return (
    <div className="min-w-screen min-h-screen bg-[#cdcae9] flex justify-center items-center">
      <div className="w-[350px] text-[#ffffff] p-2">
        <div className="relative bg-[#6f68d1] pt-24 p-4 rounded-md">
          <div className="relative">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <img
                src="http://localhost:5173/images/admin.jpg"
                alt="admin"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-1 mb-3">
              <label htmlFor="email">Email</label>
              <input
                onChange={inputHandle}
                value={state.email}
                className="px-3 py-2 outline-none border border-slate-400 bg-transparent rounded-md"
                type="text"
                name="email"
                placeholder="Email"
                id="email"
                required
              ></input>
            </div>
            <div className="flex flex-col w-full gap-1 mb-3">
              <label htmlFor="password">Password</label>
              <input
                onChange={inputHandle}
                value={state.password}
                className="px-3 py-2 outline-none border border-slate-400 bg-transparent rounded-md"
                type="password"
                name="password"
                placeholder="Password"
                id="password"
                required
              ></input>
            </div>
            <button
              disabled={loader ? true : false}
              type="submit"
              className="bg-slate-800 w-full 
            hover:shadow-blue-300/hover:shadow-lg text-white rounded-md px-7 py-2 mb-3 cursor-pointer"
            >
              {loader ? (
                <PropagateLoader cssOverride={overrideStyle} color="#fff" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
