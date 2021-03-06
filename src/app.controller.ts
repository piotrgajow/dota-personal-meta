import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { HeroService } from './hero.service';
import { GameCreate, HeroRanking, MmrStatus } from './types';
import { Composition, Game, Hero } from '@prisma/client';
import { CompositionService } from './composition.service';
import { GameService } from './game.service';
import { StatisticsService } from './statistics.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller("/api")
export class AppController {

    private readonly heroService: HeroService;
    private readonly compositionService: CompositionService;
    private readonly gameService: GameService;
    private readonly statisticsService: StatisticsService;
    private readonly usersService: UsersService;

    constructor(
        heroRankingService: HeroService,
        compositionService: CompositionService,
        gameService: GameService,
        statisticsService: StatisticsService,
        usersService: UsersService,
    ) {
        this.heroService = heroRankingService;
        this.compositionService = compositionService;
        this.gameService = gameService;
        this.statisticsService = statisticsService;
        this.usersService = usersService;
    }

    @Post('/auth/register')
    public async register(@Body() user) {
        return this.usersService.register(user.login, user.password);
    }

    @UseGuards(LocalAuthGuard)
    @Post('/auth/login')
    public async login(@Request() req) {
        return this.usersService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/auth/extend')
    public async extendToken(@Request() req) {
        return this.usersService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/hero/ranking")
    public async getHeroRanking(@Request() req): Promise<HeroRanking[]> {
        return this.heroService.getHeroRanking(req.user.id);
    }

    @Get("/hero")
    public async getHeroList(): Promise<Hero[]> {
        return this.heroService.getHeroList();
    }

    @Get("/composition")
    public async getCompositionList(): Promise<Composition[]> {
        return this.compositionService.getCompositionList();
    }

    @UseGuards(JwtAuthGuard)
    @Post("/game")
    public async postGame(@Body() gameCreate: GameCreate, @Request() req): Promise<Game> {
        const game = await this.gameService.saveGame(gameCreate, req.user.id);
        await this.statisticsService.updateMmr(req.user.id, game.mmr);
        return game;
    }

    @UseGuards(JwtAuthGuard)
    @Get("/statistics")
    public async getStatistics(@Request() req): Promise<MmrStatus> {
        return this.statisticsService.getStatistics(req.user.id);
    }

    @Get("/test")
    public async test(): Promise<any> {
        return { message: "OK" };
    }

}
