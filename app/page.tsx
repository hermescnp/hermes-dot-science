import { redirect } from "next/navigation"
import firebaseApp from "@/firebase"

export default function RootPage() {
  redirect("/en")
}
