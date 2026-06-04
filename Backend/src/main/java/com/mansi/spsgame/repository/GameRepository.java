package com.mansi.spsgame.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mansi.spsgame.entity.Game;

public interface GameRepository extends JpaRepository<Game, Long> {
}