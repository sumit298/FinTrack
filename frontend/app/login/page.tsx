"use client"

const Login = () => {

    return (
        <div className="flex flex-col h-screen justify-center items-center mb-2 bg-white">
            <div>
                {/* logo goes here... */}
                <h2 className="text-4xl font-bold mb-2">Budget Tracker</h2>
                <p className="text-base text-center text-gray-500">Premium Financial Management</p>
            </div>
            <div className="border px-6 py-5 my-4 w-[30%] border-gray-200 shadow-lg rounded-lg">
                <div className="my-3">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p>Sign in to manage your finances</p>
                </div>

                <div className="w-full ">
                    <div className="flex flex-col mb-2">
                        <label className="mb-2 mt-1 font-semibold">Email</label>
                        <input type="email" placeholder="Enter your email" className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex flex-col mb-2">
                        <label htmlFor="" className="mb-2 mt-1 font-semibold">Password</label>
                        <input type="password" placeholder="Enter your password" className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>

                    <div className="mt-4 mb-2">
                        <button className="w-full bg-gray-900 cursor-pointer text-white p-2 rounded-md hover:bg-gray-700">Sign In</button>
                    </div>

                    <div className="text-center mt-2">
                        <p className="text-sm mt-2">Don't have an account? <a href="/register" className="text-blue-500">Sign Up</a></p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Login;