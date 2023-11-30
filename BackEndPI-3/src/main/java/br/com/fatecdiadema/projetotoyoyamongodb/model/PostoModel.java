package br.com.fatecdiadema.projetotoyoyamongodb.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CNPJ;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "postos")
public class PostoModel {

    @Id
    @Field(name = "_id")
    private String _id;

    @Field(name = "nome")
    private String nome;

    @Field(name = "endereco")
    private String endereco;

    @Field(name = "horaFuncionamento")
    private String horaFuncionamento;

    @Field(name = "latitude")
    private double latitude;

    @Field(name = "longitude")
    private double longitude;

    @Field(name = "dataCriacao")
    private Date dataCriacao;

    @Field(name = "dataModificacao")
    private Date dataModificacao;

}
