import * as yup from 'yup';

export const loginSchema = yup.object({
    email: yup.string().email('E-mail deve ser um e-mail válido').required('E-mail é obrigatório').label('E-mail'),
    password: yup.string().min(8, 'Senha deve ter pelo menos 8 caracteres').required('Senha é obrigatória').label('Senha')
});

export const signupSchema = yup.object({
    name: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres').required('Nome é obrigatório').label('Nome'),
    email: yup.string().email('E-mail deve ser um e-mail válido').required('E-mail é obrigatório').label('E-mail'),
    password: yup.string().min(8, 'Senha deve ter pelo menos 8 caracteres').required('Senha é obrigatória').label('Senha'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'As senhas devem ser iguais')
        .required('Confirmação de senha é obrigatória')
        .label('Confirmação de senha')
});

export const resetPasswordSchema = yup.object({
    password: yup.string().min(8, 'Senha deve ter pelo menos 8 caracteres').required('Senha é obrigatória').label('Senha'),
    confirmPassword: yup.string()
        .min(8, 'Confirmação de senha deve ter pelo menos 8 caracteres')
        .required('Confirmação de senha é obrigatória')
        .oneOf([yup.ref('password')], 'As senhas devem ser iguais')
        .label('Confirmação de senha')
});

export const requestPasswordResetSchema = yup.object({
    email: yup.string().email('E-mail deve ser um e-mail válido').required('E-mail é obrigatório').label('E-mail')
});