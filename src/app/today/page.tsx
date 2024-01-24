export default function TodayPage() {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div>
            <h1>{today}</h1>
        </div>
    )
}