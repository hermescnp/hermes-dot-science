"use client"

const HomePageClient = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Hermes Dot Science</h1>
      <p className="mb-4">This is a client-side rendered page.</p>

      <div className="border-gradient p-4 rounded-md">
        <p>Powered by Hermes Dot Science</p>
      </div>
    </div>
  )
}

export default HomePageClient

// Add some basic styling (you can move this to a separate CSS file)
const styles = `
  .border-gradient {
    border: 5px solid transparent;
    background-image: linear-gradient(to right, #9D50BB, #6E48AA, #E27D4A); /* Updated gradient */
    background-clip: padding-box;
  }
`

// Inject the styles into the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
