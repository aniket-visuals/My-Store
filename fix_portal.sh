sed -i '1,17c\
import React, { useState, useEffect } from "react";\
import { X, User, Mail, Lock, LogOut, Check, Database, Sparkles, Eye, EyeOff, AlertTriangle, MapPin, FileText, Menu } from "lucide-react";\
import { checkUsernameAvailability, checkEmailExists, googleSignIn, emailSignIn, emailSignUp, logout, initAuth, sendForgotPasswordEmail } from "../services/authService";\
' src/components/AccountPortal.tsx
