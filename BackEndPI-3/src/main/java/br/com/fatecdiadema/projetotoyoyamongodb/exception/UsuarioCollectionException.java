package br.com.fatecdiadema.projetotoyoyamongodb.exception;

public class UsuarioCollectionException extends Exception {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public UsuarioCollectionException(String message) {
        super(message);
    }

    public static String NotFoundException(String id) {
        return "Usuario com id " + id + " não encontrado";
    }

    public static String NomeAlreadyExists() {
        return "Nome de usuário já existe";
    }

    public static String EmailAlreadyExists() {
        return "Email já existe";
    }
}
