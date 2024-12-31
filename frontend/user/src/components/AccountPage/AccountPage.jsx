'use client'

import { useState , useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, MapPin, CreditCard, Package } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function AccountPage() {
  const [user, setUser] = useState({})

  const userDetails = useSelector((state)=>state.user);
  
  useEffect(()=>{
    setUser(userDetails)
  },[userDetails]);
  console.log('userDetails from  state',user)
  console.log(userDetails.user.firstName)

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission (e.g., API call to update user data)
    console.log('Updated user data:', user)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={userDetails.user.firstName || userDetails.user.name} 
                        onChange={handleInputChange}
                        className="bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={userDetails.user.lastName} 
                        onChange={handleInputChange}
                        className="bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={userDetails.user.email} 
                        onChange={handleInputChange}
                        className="bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        value={userDetails.user.phone} 
                        onChange={handleInputChange}
                        className="bg-gray-700"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address"
                        value={user.address} 
                        onChange={handleInputChange}
                        className="bg-gray-700"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Package className="w-6 h-6" />
                        <div>
                          <p className="font-medium">Order #{order.toString().padStart(5, '0')}</p>
                          <p className="text-sm text-gray-400">Placed on {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="settings">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Notifications</span>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Methods</span>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Privacy Settings</span>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}

