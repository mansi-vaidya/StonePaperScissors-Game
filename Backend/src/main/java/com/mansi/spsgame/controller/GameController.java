package com.mansi.spsgame.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mansi.spsgame.entity.Game;
import com.mansi.spsgame.repository.GameRepository;

@RestController
@CrossOrigin
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private GameRepository repo;

    @PostMapping
    public Game saveGame(@RequestBody Game game) {
        return repo.save(game);
    }

    @GetMapping
    public List<Game> getAllGames() {
        return repo.findAll();
    }
}
