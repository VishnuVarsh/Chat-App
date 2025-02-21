import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useEffect, useState} from "react"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";




const Auth = () => {
    const navigate = useNavigate();
    const {userInfo, setUserInfo}= useAppStore()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const validatelogin=() => {
        if (!email.trim().length) { 
            toast.error("Email is required");
            return false;
        }
        if (!password.trim().length) {
            toast.error("Password is required");
            return false;
        }
        
        return true;

    }

    const validateSignup = () => {
        if (!email.trim().length) { 
            toast.error("Email is required");
            return false;
        }
        if (!password.trim().length) {
            toast.error("Password is required");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (validatelogin()) {
            if (!email || !password) {
                toast.error("Email and password are required.");
                return;
            }
        
            try {
                const response = await apiClient.post(LOGIN_ROUTE, 
                    { email, password }, 
                    { withCredentials: true }
                );
        
                if (response.data?.user?.id) {
                    setUserInfo(response.data.user);
        
                    // Wait for state update before navigating
                    setTimeout(() => {
                        navigate(response.data.user.profileSetup ? "/chat" : "/profile");
                    }, 100);
                } else {
                    toast.error("Login failed. Please try again.");
                }
            } catch (error) {
                console.error("Login error:", error);
        
                if (error.response) {
                    toast.error(error.response.data?.message || "Invalid credentials.");
                } else {
                    toast.error("An error occurred. Please try again.");
                }
            }
        };
    };
    
    const handleSignup = async () => {
        if (!validateSignup()) return; // Ensure validation passes
    
        try {
            const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
    
            if (response.status === 201 && response.data?.user) {
                setUserInfo(response.data.user);
    
                // Since state update is asynchronous, we will navigate after it updates
            } else {
                toast.error(response.data?.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
    
            const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
            toast.error(errorMessage);
        }
    };
    
    // Use useEffect to navigate after `userInfo` is set
    useEffect(() => {
        console.log("UserInfo updated:", userInfo);
    }, [userInfo, navigate]);
    
    

    return (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
            <div className="h-[90vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
                <div className="flex flex-col gap-10 items-center justify-center">
                    <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center justify-center">
                            <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
                            <img src={Victory} alt="victory emoji" className="h-[100px] w-[100px]" />
                        </div>
                        <p className="font-medium text-center">Fill in the details to get started with the best chat app</p>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <Tabs className="w-3/4" defaultValue="login">
                            <TabsList className="bg-transparent rounded-none w-full">
                                <TabsTrigger
                                    value="login"
                                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                                >
                                    Login
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signup"
                                    className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                                >
                                    Signup
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="rounded-full p-6"
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="rounded-full p-6"
                                />
                                <Button className="rounded-full p-6" onClick={handleLogin}>Login</Button>
                            </TabsContent>
                            <TabsContent className="flex flex-col gap-5" value="signup">
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="rounded-full p-6"
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="rounded-full p-6"
                                />
                                <Input
                                    placeholder="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="rounded-full p-6"
                                />
                                <Button className="rounded-full p-6" onClick={handleSignup}>Signup</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className="hidden xl:flex justify-center items-center">
                    <img src={Background} alt="background" className="h-[500px]" />
                </div>
            </div>
        </div>
    );
};

export default Auth;