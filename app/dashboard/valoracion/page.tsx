"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/ui/encuestas.module.css";

type Respuesta = {
  pregunta_id: number;
  respuesta: string;
};

type Pregunta = {
  id: number;
  pregunta: string;
};

type Dimension = {
  dimension: string;
  preguntas: Pregunta[];
};

export default function Encuestas() {
  const [dimensiones, setDimensiones] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [user, setUser] = useState<{ id: string; jefe_id: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
    } else {
      console.error("No se encontraron datos de usuario en localStorage");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640); // Define "móvil" si el ancho es menor o igual a 640px
    };

    handleResize(); // Detecta el tamaño inicial de la pantalla
    window.addEventListener("resize", handleResize); // Escucha cambios en el tamaño

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkIfResponded = async () => {
      if (!user) {
        return;
      }

      const { id: empleado_id, jefe_id } = user;

      try {
        const response = await fetch(
          `/api/check-respuestas?empleado_id=${empleado_id}&jefe_id=${jefe_id}`
        );
        if (!response.ok) throw new Error("Error al verificar respuestas");
        const data = await response.json();

        if (data.alreadyResponded) {
          setAlreadyResponded(true);
        }
      } catch (error) {
        console.error("Error al verificar respuestas:", error);
      }
    };

    if (user) {
      checkIfResponded();
    }
  }, [user]);

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const response = await fetch("/api/preguntas");
        if (!response.ok) throw new Error("Error al obtener las preguntas");
        const data = await response.json();
        setDimensiones(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, []);

  const guardarRespuestas = async (respuestas: Respuesta[]) => {
    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    const { id: empleado_id, jefe_id } = user;

    try {
      const res = await fetch("/api/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empleado_id,
          jefe_id,
          respuestas,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar respuestas");
      }

      alert("Respuestas enviadas correctamente.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al enviar tus respuestas. Inténtalo nuevamente.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const respuestas: Respuesta[] = [];

    let formIsValid = true;

    dimensiones.forEach((dimension, dimIndex) => {
      dimension.preguntas.forEach((pregunta, pregIndex) => {
        if (dimension.dimension === "Preguntas abiertas") {
          const respuestaTexto = (
            document.getElementById(
              `open_question_${dimIndex}_${pregIndex}`
            ) as HTMLTextAreaElement
          )?.value;
          if (respuestaTexto) {
            respuestas.push({
              pregunta_id: pregunta.id,
              respuesta: respuestaTexto,
            });
          } else {
            formIsValid = false; // Si falta una respuesta, invalidamos el formulario
          }
        } else if (!isMobile) {
          const respuestaSeleccionada = document.querySelector(
            `input[name="dim${dimIndex}_preg${pregIndex}"]:checked`
          ) as HTMLInputElement | null;

          if (respuestaSeleccionada) {
            respuestas.push({
              pregunta_id: pregunta.id,
              respuesta: respuestaSeleccionada.value,
            });
          } else {
            formIsValid = false; // Si falta una respuesta, invalidamos el formulario
          }
        } else {
          const respuestaSeleccionada = (
            document.getElementById(
              `select_question_${dimIndex}_${pregIndex}`
            ) as HTMLSelectElement
          )?.value;

          if (respuestaSeleccionada && respuestaSeleccionada !== "null") {
            respuestas.push({
              pregunta_id: pregunta.id,
              respuesta: respuestaSeleccionada,
            });
          } else {
            formIsValid = false; // Si falta una respuesta, invalidamos el formulario
          }
        }
      });
    });

    if (!formIsValid) {
      alert("Por favor responde todas las preguntas antes de enviar.");
      return;
    }

    setIsSubmitting(true); // Desactivar el botón y mostrar animación

    await guardarRespuestas(respuestas);

    setIsSubmitting(false); // Reactivar el botón después de enviar
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== "null") {
      event.target.classList.add("border-4");
      event.target.style.borderColor = "#7C3C8B";
    } else {
      event.target.classList.remove("border-4");
      event.target.style.borderColor = "#D1D5DB"; // Restablecer al color gris predeterminado
    }
  };

  if (loading) return <div>Cargando preguntas...</div>;
  if (error) return <div>Error: {error}</div>;

  if (alreadyResponded) {
    return (
      <div className="text-center text-gray-400 text-3xl my-12">
        <h1>¡Gracias por tu participación!</h1>
        <p>
          Has completado con éxito la encuesta de clima organizacional. Tu
          aporte te convierte en una pieza clave para impulsar los cambios
          positivos en nuestra organización.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-w-[400px]  p-5 rounded-lg bg-gray-100"
      >
        {dimensiones.map((dimension, dimIndex) => (
          <div
            key={dimIndex}
            className="mb-2 border border-gray-300 rounded-lg p-2 bg-white"
          >
            <h2 className="mb-5 text-gray-800 text-xl font-bold text-center">
              {dimension.dimension}
            </h2>
            {dimension.dimension === "Preguntas abiertas" ? (
              dimension.preguntas.map((pregunta, pregIndex) => (
                <div key={pregIndex} className="mb-5">
                  <label
                    htmlFor={`open_question_${dimIndex}_${pregIndex}`}
                    className="block mb-2 font-bold text-gray-800"
                  >
                    {pregunta.pregunta}
                  </label>
                  <textarea
                    id={`open_question_${dimIndex}_${pregIndex}`}
                    name={`dim${dimIndex}_preg${pregIndex}`}
                    required
                    maxLength={200}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              ))
            ) : isMobile ? (
              dimension.preguntas.map((pregunta, pregIndex) => (
                <div
                  key={pregIndex}
                  className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full overflow-x-hidden"
                >
                  <label
                    htmlFor={`select_question_${dimIndex}_${pregIndex}`}
                    className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-0"
                  >
                    {pregunta.pregunta}
                  </label>
                  <select
                    id={`select_question_${dimIndex}_${pregIndex}`}
                    name={`dim${dimIndex}_preg${pregIndex}`}
                    className={`w-full p-3 border rounded-lg focus:outline-none text-sm transition-all ${
                      selectedAnswers[`select_question_${dimIndex}_${pregIndex}`] ? "border-[#7C3C8B]" : "border-gray-300"
                    }`}
                    required
                    defaultValue="null"
                    onChange={handleSelectChange}
                  >
                    <option
                      value="null"
                      disabled
                      className="text-sm sm:text-base"
                    >
                      Responder
                    </option>
                    <option value="1" className="text-sm sm:text-base">
                      Nunca
                    </option>
                    <option value="2" className="text-sm sm:text-base">
                      Algunas veces
                    </option>
                    <option value="3" className="text-sm sm:text-base">
                      Casi siempre
                    </option>
                    <option value="4" className="text-sm sm:text-base">
                      Siempre
                    </option>
                  </select>
                </div>
              ))
            ) : (
              <table className="w-full border-collapse bg-gray-100 rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b border-gray-400">
                    <th className="bg-gray-400 text-white text-center font-bold py-2 rounded-t-lg">
                      CRITERIOS DE VALORACIÓN
                    </th>
                    <th
                      className="bg-gray-300 text-gray-700 text-center font-bold py-2"
                      colSpan={4}
                    >
                      ESCALA DE VALORACIÓN
                    </th>
                  </tr>

                  <tr>
                    <th className="border border-gray-300"></th>
                    <th
                      className={`p-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${styles.valoracion} border border-gray-300`}
                    >
                      <img
                        src="/img/nunca.png"
                        alt="Nunca"
                        className="h-10 w-10 mx-auto mt-2"
                      />
                      Nunca
                    </th>
                    <th
                      className={`p-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${styles.valoracion} border border-gray-300`}
                    >
                      <img
                        src="/img/casi_nunca.png"
                        alt="casi nunca"
                        className="h-10 w-10 mx-auto mt-2"
                      />
                      Algunas veces
                    </th>
                    <th
                      className={`p-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-nowrap ${styles.valoracion} border border-gray-300`}
                    >
                      <img
                        src="/img/casi_siempre.png"
                        alt="casi siempre"
                        className="h-10 w-10 mx-auto mt-2"
                      />
                      Casi siempre
                    </th>
                    <th
                      className={`p-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl ${styles.valoracion} border border-gray-300`}
                    >
                      <img
                        src="/img/siempre.png"
                        alt="siempre"
                        className="h-10 w-10 mx-auto mt-2"
                      />
                      Siempre
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dimension.preguntas.map((pregunta, pregIndex) => (
                    <tr key={pregIndex}>
                      <td className="border border-gray-300">{`${
                        pregIndex + 1
                      }. ${pregunta.pregunta}`}</td>
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <td
                            key={i}
                            className="border border-gray-300 text-center p-3"
                          >
                            <input
                              type="radio"
                              name={`dim${dimIndex}_preg${pregIndex}`}
                              value={i + 1}
                              required
                              className={styles.ratio}
                            />
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="block mx-auto px-6 py-2 bg-gray-400 text-white rounded-lg text-lg cursor-pointer transition-colors duration-300 hover:bg-gray-300 hover:text-black"
        >
          Enviar respuestas
        </button>
      </form>



    </>
  );
}
