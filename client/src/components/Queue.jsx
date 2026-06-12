import { useEffect, useState } from 'react'
import api from '../api/axios'

function Queue({ roomId }) {

  const [queue, setQueue] =
    useState([])

  useEffect(() => {

    if (!roomId)
      return

    fetchQueue()

  }, [roomId])

  const fetchQueue =
    async () => {

      try {

        const response =
          await api.get(
            `/rooms/queue/${roomId}`
          )

        setQueue(
          response.data
        )

      } catch (error) {

        console.log(error)
      }
    }

  return (

    <div className="mt-5">

      <h2 className="text-xl">
        Queue
      </h2>

      {
        queue.map(
          (item) => (

            <div
              key={item.id}
              className="border p-2 mb-2"
            >
            <span>
              <p>
                {
                  item.songs?.title
                }
              </p>

              <p>
                {
                  item.songs?.artist
                }
              </p>

            </span>
              
            </div>
          )
        )
      }

    </div>
  )
}

export default Queue