export interface Comment {
  id: string;
  user_name: string;
  comment: string;
  stars: number;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
}

export const mockComments: Comment[] = [
  {
    id: "1",
    user_name: "María García",
    comment:
      "Excelente servicio, muy recomendado. La atención al cliente fue excepcional y el producto llegó en perfectas condiciones.",
    stars: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "2",
    user_name: "Juan Pérez",
    comment:
      "Buen producto pero la entrega tardó más de lo esperado. Sin embargo, la calidad compensa la espera.",
    stars: 4,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "3",
    user_name: "Ana Martínez",
    comment:
      "No cumplió mis expectativas. El producto no era como se mostraba en las fotos.",
    stars: 2,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "4",
    user_name: "Carlos López",
    comment:
      "Producto de calidad media, precio justo. Cumple con lo básico pero nada extraordinario.",
    stars: 3,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "5",
    user_name: "Laura Sánchez",
    comment:
      "Increíble experiencia de compra. Todo perfecto desde el inicio hasta la entrega. Volveré a comprar sin duda.",
    stars: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: null,
  },
  {
    id: "6",
    user_name: "Tienda Oficial",
    comment:
      "Gracias por tu comentario María. Nos alegra que hayas tenido una buena experiencia con nosotros.",
    stars: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: "1",
  },
  {
    id: "7",
    user_name: "Pedro Ramírez",
    comment: "Yo también tuve una experiencia similar. Muy recomendado.",
    stars: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: "1",
  },
  {
    id: "8",
    user_name: "Tienda Oficial",
    comment:
      "Lamentamos la demora Juan. Estamos trabajando para mejorar nuestros tiempos de entrega.",
    stars: 4,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    parent_id: "2",
  },
];
