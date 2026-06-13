import { useNavigate } from 'react-router-dom'

function Home() {

  const navigate = useNavigate()

  return (
    <div className="p-10">

      <h1 className="text-3xl mb-6">
        Collaborative Music Room
      </h1>

      <div className="flex gap-4">

        <button
          onClick={() => navigate('/signup')}
          className="
            bg-green-500
            text-white
            px-6
            py-2
            rounded
          "
        >
          Signup
        </button>

        <button
          onClick={() => navigate('/login')}
          className="
            bg-blue-500
            text-white
            px-6
            py-2
            rounded
          "
        >
          Login
        </button>

      </div>

    </div>
  )
}

export default Home