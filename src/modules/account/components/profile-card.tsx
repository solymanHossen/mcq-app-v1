"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { updateProfileNameAction } from "@/modules/account/actions"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function ProfileCard({
  name,
  email,
  role,
  joinedAt,
  lastLoginAt,
}: {
  name: string
  email: string
  role: string
  joinedAt: string
  lastLoginAt: string | null
}) {
  const [value, setValue] = useState(name)
  const [isPending, startTransition] = useTransition()
  const dirty = value.trim().length > 0 && value.trim() !== name

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateProfileNameAction(value.trim())
      if ("error" in result) toast.error(result.error)
      else toast.success("Profile updated")
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-medium text-primary">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name is shown to students on exams and leaderboards.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="shrink-0 capitalize">
          {role.toLowerCase()}
        </Badge>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>
          <p className="text-xs text-muted-foreground">
            Member since {joinedAt}
            {lastLoginAt && <> · Last login {lastLoginAt}</>}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!dirty || isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
