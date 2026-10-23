import { GENDER, ROLE_NAME } from "@/common"
import * as yup from "yup"

export const registerSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  name: yup
    .string()
    .required("Full name is required")
    .max(255, "Full name must not exceed 255 characters"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
      "Invalid Vietnamese phone number"
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),

  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .typeError("Invalid date of birth"),

  gender: yup
    .mixed<GENDER>()
    .oneOf(Object.values(GENDER), "Invalid gender")
    .required("Gender is required"),

  role: yup
    .mixed<ROLE_NAME>()
    .oneOf(Object.values(ROLE_NAME), "Invalid role")
    .required("Role is required"),
})

export type RegisterFormValues = yup.InferType<typeof registerSchema>
