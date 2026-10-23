// "use client"

// import { useFormik } from "formik"
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { RegisterFormValues, registerSchema } from "./config"
// import { GENDER, ROLE_NAME } from "@/common"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { useState, useEffect, useRef } from "react"
// import { Calendar } from "@/components/ui/calendar"
// import { Link, useRouter } from "@/i18n/navigation"
// import { buildQueryParams, formatDate } from "@/lib/utils"
// import { useDebounce } from "@/hooks/useDebounce"
// import { Loader2, CheckCircle2, XCircle } from "lucide-react"
// import axiosInstance from "@/lib/axiosInstance"
// import { useAuth } from "@/hooks/useAuth"
// import { ApiResponse } from "@/hooks/global"

// type EmailCheckStatus = "idle" | "checking" | "available" | "taken" | "error"

// const initialValues: RegisterFormValues = {
//   email: "",
//   name: "",
//   phone: "",
//   password: "",
//   confirmPassword: "",
//   dateOfBirth: new Date(),
//   gender: GENDER.FEMALE,
//   role: ROLE_NAME.PATIENT,
// }

// const RegisterForm = () => {
//   const [open, setOpen] = useState(false)
//   const [emailStatus, setEmailStatus] = useState<EmailCheckStatus>("idle")
//   const { register } = useAuth()
//   const { getRedirectPath } = useAuth()

//   const router = useRouter()

//   const formik = useFormik<RegisterFormValues>({
//     initialValues,
//     validationSchema: registerSchema,
//     onSubmit: async (values, formikHelpers) => {
//       if (emailStatus !== "available") return
//       try {
//         await register(values)
//         const path = getRedirectPath()
//         router.push(path || "/")
//       } catch (error) {}
//       formikHelpers.setSubmitting(false)
//     },
//   })

//   const debouncedEmail = useDebounce(formik.values.email, 600)

//   const prevDebouncedEmail = useRef<string>("")

//   useEffect(() => {
//     if (debouncedEmail === prevDebouncedEmail.current) return
//     prevDebouncedEmail.current = debouncedEmail

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!debouncedEmail || !emailRegex.test(debouncedEmail)) {
//       setEmailStatus("idle")
//       return
//     }

//     const controller = new AbortController()

//     const checkEmail = async () => {
//       setEmailStatus("checking")
//       try {
//         const response = await axiosInstance<ApiResponse<number>>(
//           `/api/v1/auth/count-email?${buildQueryParams({ email: debouncedEmail })}`,
//           {
//             signal: controller.signal,
//           }
//         )

//         setEmailStatus(response.data?.body === 0 ? "available" : "taken")
//       } catch (err) {
//         if ((err as Error).name === "AbortError") return
//         setEmailStatus("error")
//       }
//     }

//     checkEmail()

//     return () => controller.abort()
//   }, [debouncedEmail])

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmailStatus("idle")
//     formik.handleChange(e)
//   }

//   const isSubmitDisabled =
//     formik.isSubmitting || emailStatus === "checking" || emailStatus === "taken"

//   return (
//     <Card className="mx-auto w-full max-w-2xl">
//       <CardHeader>
//         <CardTitle>Create an account</CardTitle>
//         <CardDescription>
//           Enter your information below to create your account
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={formik.handleSubmit}>
//           <FieldGroup className="gap-5">
//             {/* Row 1: Full Name + Phone */}
//             <div className="grid grid-cols-2 gap-4">
//               <Field>
//                 <FieldLabel htmlFor="name">Full Name</FieldLabel>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="John Doe"
//                   {...formik.getFieldProps("name")}
//                 />
//                 {formik.touched.name && formik.errors.name && (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.name}
//                   </FieldDescription>
//                 )}
//               </Field>

//               <Field>
//                 <FieldLabel htmlFor="phone">Phone</FieldLabel>
//                 <Input
//                   id="phone"
//                   type="text"
//                   placeholder="0912345678"
//                   {...formik.getFieldProps("phone")}
//                 />
//                 {formik.touched.phone && formik.errors.phone && (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.phone}
//                   </FieldDescription>
//                 )}
//               </Field>
//             </div>

//             <Field>
//               <FieldLabel htmlFor="email">Email</FieldLabel>
//               <div className="relative">
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   className="pr-9"
//                   {...formik.getFieldProps("email")}
//                   onChange={handleEmailChange}
//                 />
//                 {/* Status icon bên phải input */}
//                 <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
//                   {emailStatus === "checking" && (
//                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//                   )}
//                   {emailStatus === "available" && (
//                     <CheckCircle2 className="h-4 w-4 text-green-500" />
//                   )}
//                   {emailStatus === "taken" && (
//                     <XCircle className="h-4 w-4 text-red-500" />
//                   )}
//                   {emailStatus === "error" && (
//                     <XCircle className="h-4 w-4 text-yellow-500" />
//                   )}
//                 </div>
//               </div>

//               {/* Priority: formik error > api status messages */}
//               {formik.touched.email && formik.errors.email ? (
//                 <FieldDescription className="text-red-500">
//                   {formik.errors.email}
//                 </FieldDescription>
//               ) : emailStatus === "checking" ? (
//                 <FieldDescription className="text-muted-foreground">
//                   Checking availability...
//                 </FieldDescription>
//               ) : emailStatus === "available" ? (
//                 <FieldDescription className="text-green-600">
//                   Email is available.
//                 </FieldDescription>
//               ) : emailStatus === "taken" ? (
//                 <FieldDescription className="text-red-500">
//                   This email is already registered.
//                 </FieldDescription>
//               ) : emailStatus === "error" ? (
//                 <FieldDescription className="text-yellow-600">
//                   Could not verify email. Please try again.
//                 </FieldDescription>
//               ) : (
//                 <FieldDescription>
//                   We'll use this to contact you.
//                 </FieldDescription>
//               )}
//             </Field>

//             {/* Row 3: Password + Confirm Password */}
//             <div className="grid grid-cols-2 gap-4">
//               <Field>
//                 <FieldLabel htmlFor="password">Password</FieldLabel>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Your strong password"
//                   {...formik.getFieldProps("password")}
//                 />
//                 {formik.touched.password && formik.errors.password ? (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.password}
//                   </FieldDescription>
//                 ) : (
//                   <FieldDescription>At least 8 characters.</FieldDescription>
//                 )}
//               </Field>

//               <Field>
//                 <FieldLabel htmlFor="confirmPassword">
//                   Confirm Password
//                 </FieldLabel>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   placeholder="Re-enter your password"
//                   {...formik.getFieldProps("confirmPassword")}
//                 />
//                 {formik.touched.confirmPassword &&
//                 formik.errors.confirmPassword ? (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.confirmPassword}
//                   </FieldDescription>
//                 ) : (
//                   <FieldDescription>Enter password again.</FieldDescription>
//                 )}
//               </Field>
//             </div>

//             <Field>
//               <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
//               <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     id="dateOfBirth"
//                     className="w-full justify-start font-normal"
//                   >
//                     {formik.values.dateOfBirth
//                       ? formatDate(formik.values.dateOfBirth)
//                       : "Select date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent
//                   className="w-auto overflow-hidden p-0"
//                   align="start"
//                 >
//                   <Calendar
//                     mode="single"
//                     selected={formik.values.dateOfBirth}
//                     defaultMonth={formik.values.dateOfBirth}
//                     captionLayout="dropdown"
//                     onSelect={(date) => {
//                       formik.setFieldValue("dateOfBirth", date)
//                       setOpen(false)
//                     }}
//                   />
//                 </PopoverContent>
//               </Popover>
//               {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
//                 <FieldDescription className="text-red-500">
//                   {String(formik.errors.dateOfBirth)}
//                 </FieldDescription>
//               )}
//             </Field>

//             <div className="grid grid-cols-2 gap-4">
//               <Field>
//                 <FieldLabel htmlFor="gender">Gender</FieldLabel>
//                 <Select
//                   value={formik.values.gender}
//                   onValueChange={(value) => {
//                     formik.setFieldValue("gender", value)
//                     formik.setFieldTouched("gender", true)
//                   }}
//                 >
//                   <SelectTrigger id="gender" className="w-full">
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Object.values(GENDER).map((g) => (
//                       <SelectItem key={g} value={g}>
//                         {g}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {formik.touched.gender && formik.errors.gender && (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.gender}
//                   </FieldDescription>
//                 )}
//               </Field>

//               <Field>
//                 <FieldLabel htmlFor="role">Role</FieldLabel>
//                 <Select
//                   value={formik.values.role}
//                   onValueChange={(value) => {
//                     formik.setFieldValue("role", value)
//                     formik.setFieldTouched("role", true)
//                   }}
//                 >
//                   <SelectTrigger id="role" className="w-full">
//                     <SelectValue placeholder="Select role" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="patient">Patient</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {formik.touched.role && formik.errors.role && (
//                   <FieldDescription className="text-red-500">
//                     {formik.errors.role}
//                   </FieldDescription>
//                 )}
//               </Field>
//             </div>

//             {/* Submit */}
//             <div className="flex flex-col gap-3 border-t pt-4">
//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isSubmitDisabled}
//               >
//                 {formik.isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
//                     account...
//                   </>
//                 ) : (
//                   "Create Account"
//                 )}
//               </Button>
//               {/* <Button variant="outline" type="button" className="w-full">
//                 Sign up with Google
//               </Button> */}
//               <p className="text-center text-sm text-muted-foreground">
//                 Already have an account?{" "}
//                 <Link
//                   href="/auth/login"
//                   className="underline underline-offset-4"
//                 >
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </FieldGroup>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// export default RegisterForm
