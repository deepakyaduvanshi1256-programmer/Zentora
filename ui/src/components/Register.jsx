import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

const schema = yup.object({
  type: yup
    .string()
    .oneOf(["client", "user"], "Please select account type")
    .required("Account type is required"),

  name: yup
    .string()
    .required("Name is required")
    .min(2, "Minimum 2 characters")
    .max(15, "Maximum 15 characters"),

  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Minimum 6 characters")
    .max(15, "Maximum 15 characters"),

  cpassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      type: "client",
      name: "",
      email: "",
      password: "",
      cpassword: "",
    },
  });

  const handleRegister = async (data) => {
    setServerMessage({ type: "", text: "" });
    try {
      const { cpassword, ...payload } = data;

      const res = await axiosInstance.post("/register", payload);

      if (res?.data?.success) {
        reset();
        navigate("/login", { state: { message: "Registration successful! Please sign in with your new account." } });
      } else {
        setServerMessage({ type: "danger", text: res?.data?.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        setServerMessage({ type: "danger", text: "Server is not reachable. Start the API server and try again." });
      } else {
        setServerMessage({ type: "danger", text: error.response?.data?.message || "Registration failed. Please try again." });
      }
    }
  };

  return (
    <main className="register-page neu-auth-page container-fluid py-5 min-vh-100 d-flex justify-content-center align-items-center">
      <div className="register-card neu-auth-card card border-0 p-4 p-md-5 mx-auto" style={{ maxWidth: '760px' }}>
        <p className="text-uppercase small-title mb-2">
          Get Started
        </p>

        <h1 className="fw-bold mb-2">Create Account</h1>

        <p className="text-muted mb-4">
          Already have an account?{" "}
          <Link to="/login" className="signin-link">
            Sign in here
          </Link>
        </p>

        {serverMessage.text && (
          <div className={`alert alert-${serverMessage.type}`} role="alert">
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit(handleRegister)}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Register As
              </label>

              <select
                className="form-select"
                {...register("type")}
                disabled={isSubmitting}
              >
                <option value="client">
                  Client — I want to hire
                </option>
                <option value="user">
                  Freelancer — I want to work
                </option>
              </select>

              <p className="text-danger">
                {errors.type?.message}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Full Name / Company
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Your name or company"
                autoComplete="name"
                {...register("name")}
                disabled={isSubmitting}
              />

              <p className="text-danger">
                {errors.name?.message}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              disabled={isSubmitting}
            />

            <p className="text-danger">
              {errors.email?.message}
            </p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                {...register("password")}
                disabled={isSubmitting}
              />

              <p className="text-danger">
                {errors.password?.message}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Confirm Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                autoComplete="new-password"
                {...register("cpassword")}
                disabled={isSubmitting}
              />

              <p className="text-danger">
                {errors.cpassword?.message}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn register-btn w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-muted mt-3 small">
            Admin accounts are created by the platform team
            only — not available via registration.
          </p>
        </form>
      </div>
    </main>
  );
};

export default Register;





















// import React from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import Swal from "sweetalert2";
// import axiosInstance from "../utils/axiosInstance";
// import { useNavigate } from "react-router-dom";

// const schema = yup.object({
//   type: yup
//     .string()
//     .oneOf(["client", "user"], "Please select account type")
//     .required("Account type is required"),

//   name: yup
//     .string()
//     .required("Name is required")
//     .min(2, "Minimum 2 characters")
//     .max(15, "Maximum 15 characters"),

//   email: yup
//     .string()
//     .email("Invalid email")
//     .required("Email is required"),

//   password: yup
//     .string()
//     .required("Password is required")
//     .min(6, "Minimum 6 characters")
//     .max(15, "Maximum 15 characters"),

//   cpassword: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords do not match")
//     .required("Confirm Password is required"),
// });

// const Register = () => {
//   const navigate = useNavigate();
//   const { register,handleSubmit,formState: { errors }, reset,} = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       type: "",
//       name: "",
//       email: "",
//       password: "",
//       cpassword: "",
//     },
//   });

//   const handleRegister = async (data) => {
//     try {
//       const { cpassword, ...payload } = data;
//       const res = await axiosInstance.post("/register", payload);

//       if (res.data.success) {
//         Swal.fire({
//           title: "Register",
//           text: res.data.message,
//           icon: "success",
//         });

//         reset();
//         navigate("/login");
//       } else {
//         Swal.fire({
//           title: "Register",
//           text: res.data.message,
//           icon: "error",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message,
//         icon: "error",
//       });
//     }
//   };

//   return (
//     <div className="register-page d-flex justify-content-center align-items-center">
//       <div className="register-card shadow">
//         <p className="text-uppercase small-title mb-2">Get Started</p>

//         <h1 className="fw-bold mb-2">Create Account</h1>

//         <p className="text-muted mb-4">
//           Already have an account?{" "}
//           <a href="/login" className="signin-link">
//             Sign in here
//           </a>
//         </p>

//         <form onSubmit={handleSubmit(handleRegister)}>
//           <div className="row">
//             <div className="col-md-6 mb-3">
//               <label className="form-label fw-semibold">
//                 Register As
//               </label>

//               <select
//                 className="form-select"
//                 {...register("type")}
//               >
//                 <option value="client">  Client — I want to hire</option>
//                 <option value="user">  Freelancer — I want to work</option>
//               </select>

//               <p className="text-danger">{errors.type?.message}</p>
//             </div>

//             <div className="col-md-6 mb-3">
//               <label className="form-label fw-semibold">
//                 Full Name / Company
//               </label>

//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Your name or company"
//                 {...register("name")}
//               />

//               <p className="text-danger">{errors.name?.message}</p>
//             </div>
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Email Address
//             </label>

//             <input
//               type="email"
//               className="form-control"
//               placeholder="you@example.com"
//               {...register("email")}
//             />

//             <p className="text-danger">{errors.email?.message}</p>
//           </div>

//           <div className="row">
//             <div className="col-md-6 mb-3">
//               <label className="form-label fw-semibold">
//                 Password
//               </label>

//               <input
//                 type="password"
//                 className="form-control"
//                 placeholder="Minimum 6 characters"
//                 {...register("password")}
//               />

//               <p className="text-danger">
//                 {errors.password?.message}
//               </p>
//             </div>

//             <div className="col-md-6 mb-3">
//               <label className="form-label fw-semibold">
//                 Confirm Password
//               </label>

//               <input
//                 type="password"
//                 className="form-control"
//                 placeholder="Confirm Password"
//                 {...register("cpassword")}
//               />

//               <p className="text-danger">
//                 {errors.cpassword?.message}
//               </p>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="btn register-btn w-100"
//           >
//             Create Account
//           </button>

//           <p className="text-center text-muted mt-3 small">
//             Admin accounts are created by the platform team only — not
//             available via registration.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;