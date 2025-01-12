"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "next-auth/react";

import React from 'react'

const SettingsPage = () => {
    const user = useCurrentUser();

    const submit = () => {
        signOut();
    }

  return (
    <div>
        {JSON.stringify(user)}
        <Button onClick={submit}>
            SignOut
        </Button>
    </div>
  )
}

export default SettingsPage