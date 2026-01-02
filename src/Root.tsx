import './theme/index.css';

import { createRouter } from "./app/router";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as yup from "yup";

// Configure Yup for Brazilian Portuguese BEFORE any schemas are created
yup.setLocale({
  mixed: {
    default: '${path} é inválido',
    required: '${path} é obrigatório',
    oneOf: '${path} deve ser um dos seguintes valores: ${values}',
    notOneOf: '${path} não deve ser um dos seguintes valores: ${values}',
    notType: '${path} deve ser do tipo ${type}',
  },
  string: {
    length: '${path} deve ter exatamente ${length} caracteres',
    min: '${path} deve ter pelo menos ${min} caracteres',
    max: '${path} deve ter no máximo ${max} caracteres',
    matches: '${path} deve corresponder ao padrão: "${regex}"',
    email: '${path} deve ser um e-mail válido',
    url: '${path} deve ser uma URL válida',
    uuid: '${path} deve ser um UUID válido',
    trim: '${path} não deve conter espaços em branco no início ou no fim',
    lowercase: '${path} deve estar em minúsculas',
    uppercase: '${path} deve estar em maiúsculas',
  },
  number: {
    min: '${path} deve ser maior ou igual a ${min}',
    max: '${path} deve ser menor ou igual a ${max}',
    lessThan: '${path} deve ser menor que ${less}',
    moreThan: '${path} deve ser maior que ${more}',
    positive: '${path} deve ser um número positivo',
    negative: '${path} deve ser um número negativo',
    integer: '${path} deve ser um número inteiro',
  },
  date: {
    min: '${path} deve ser posterior a ${min}',
    max: '${path} deve ser anterior a ${max}',
  },
  boolean: {
    isValue: '${path} deve ser ${value}',
  },
  object: {
    noUnknown: '${path} contém chaves desconhecidas: ${unknown}',
  },
  array: {
    min: '${path} deve ter pelo menos ${min} itens',
    max: '${path} deve ter no máximo ${max} itens',
    length: '${path} deve ter ${length} itens',
  },
});

const Root = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });

    const router = createRouter();

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
};

export default Root;
