package com.mansi.spsgame.entity;

import jakarta.persistence.*;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String player1;
    private String player2;

    @Column(length = 2000)
    private String rounds;

    private String finalWinner;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getPlayer1() {
        return player1;
    }

    public void setPlayer1(String player1) {
        this.player1 = player1;
    }

    public String getPlayer2() {
        return player2;
    }

    public void setPlayer2(String player2) {
        this.player2 = player2;
    }

    public String getRounds() {
        return rounds;
    }

    public void setRounds(String rounds) {
        this.rounds = rounds;
    }

    public String getFinalWinner() {
        return finalWinner;
    }

    public void setFinalWinner(String finalWinner) {
        this.finalWinner = finalWinner;
    }
}
