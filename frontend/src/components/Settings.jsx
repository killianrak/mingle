import { Input } from "./Input"

function Settings(){
    return <main className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold text-center">Account Settings</h1>
    <div className="mt-6 space-y-12">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Change Password</h3>
          <p className="text-sm text-muted-foreground">Update your account password.</p>
        </div>
        <div className="p-6 space-y-4">
          <Input name="Current Password" type="password" id="currentpassword" />
          <Input name="New password" type="password" id="newpassword" />
        </div>
        <div className="flex items-center p-6">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ml-auto">
            Update Password
          </button>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
            Licenses &amp; Subscriptions
          </h3>
          <p className="text-sm text-muted-foreground">Manage your licenses and subscriptions.</p>
        </div>
        <div className="p-6">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            View Licenses &amp; Subscriptions
          </button>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Personal Information</h3>
          <p className="text-sm text-muted-foreground">Update your personal information.</p>
        </div>
        <div className="p-6 space-y-4">
          <Input name="Name" type="text"/>
          <Input name="Email" type="text" />
        </div>
        <div className="flex items-center p-6">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ml-auto">
            Update Information
          </button>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
            Advanced Security Settings
          </h3>
          <p className="text-sm text-muted-foreground">Manage your advanced security settings.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              role="checkbox"
              aria-checked="false"
              data-state="unchecked"
              value="on"
              className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              id="two-factor-authentication"
            ></button>
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="two-factor-authentication"
            >
              Two-Factor Authentication
            </label>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Account Deactivation</h3>
          <p className="text-sm text-muted-foreground">Deactivate your account.</p>
        </div>
        <div className="p-6">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-red-600">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
    </main>
}

export {Settings}