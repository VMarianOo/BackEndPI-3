package br.com.fatecdiadema.projetotoyoyamongodb.service;

import br.com.fatecdiadema.projetotoyoyamongodb.exception.PostoCollectionException;
import jakarta.validation.ConstraintViolationException;

public interface PostoService {

    public void createPosto(String _id,String nome, String endereco, String horarioFuncionamento) throws ConstraintViolationException, PostoCollectionException;
}
