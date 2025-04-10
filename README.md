# M12.2 Final Project Lab

## General Theme
    I want this project to create a fun game on a webpage. I plan on using the ball game with the evil circle for a stepping stone to beginning this project. Instead of the game starting as you open the game it will start when a button is pressed and will keep track of score.

## What it will do
    I want the users to begin in a menu screen, to start there will be options, a start button, maybe a level select so players can try out different modes of player maps, and then I want there to be a leaderboard of some sort. Obviosuly the start button will take the person out of the menu page and into the game. It's still up for consideration but I'm thinking maybe the game will be focused somewhat around eliminating enemies, objective based themes, maybe time constraints or all of them. I beleive using similar aspects of the evil circle to be used as like projectiles or maybe even obstacles can help with creating the game in a way where the user can destroy enemeies or break objectives.Implementing the levels will be a nice way to have different modes and styles of game play. I want the users to have lives and have a specific name and unique ID for logging. The level select button is self explanitory and it will allow the user to pick a level of their choice to play when they click start. With that being said I'm conflicted between 2 options making the user pick levels they can play as challenges and having the start button select that button, or I make the start button just play a random game that is endless or based on lives and the levels are just additional challenges people can take. That will be something I fully decide when I start implememting the game. Lastly, will be the leaderboard, if possible I would like to make a table leaderboard for each of the specified levels which is where I will use my AWS to log players scores. I could have it display anywhere from the top 10 to maybe 25 scores which will help incorporate alot of our other labs and the newly used aws into the final project.

## Target Audience
    This game is intended really for anyone, the general public should be able to use this game to have fun and expierience hopefully a somewhat challenging and engaging interaction. I would also like for this game to be something that could be built on and improved.

## Data Managment
    As mentioned before I plan to use AWS for some type of leaderboard to keep track of scoring. I might need to store data like player names, times, scored objects or enemies eliminated could all go into deciding and storing leaderboard standings. I will need a way for it to know which leaderboard is for which level of play.

## Stretch Goals
    I really dont want to bit off more than I can choose with this project, I beleive most of what I put is achievable in some sort of way. Looking at the grading requirments and rubric I think I can cover most everything with what I have listed. I believe can easily hit the css styles I need with all the different levels, menus, and leaderboards. I believe having these differenet aspects of my gae can make it easier to split them up in multiple htmls. I plan to use AWS to log and submt data, my only real issues is finding how to properly implement a delete options for entries. For user names and IDs I can have those sanitized inputs required. So for stretch goals, I think alot of it will be based on how much I implement and how well rounded my game is , the more time I put the more polished and complete it becomes. If I have time and most everything goes well, I would like to add a difficulty options that could possibly make enemies move faster, shoot faster, shoot more accurately or maybe the user has less lives. I think it will also be hard to incorporate like some sort of unique ID so a user could prove a score was theirs but maybe I'll figure something out. Finally, I want to add some kind of custumizable options that are a little more detailed that the user could add for their little player in the game but I want to focus more on functionality before I play with fancy details thats why I'm throwing it in the stretch goals.
## Getting Started

To get started, clone this repository and run the following commands:

```bash
npm install
```
This will install the necessary dependencies for the project.

## Development

It is recommended to use the VSCode Live Server extension to run the project
locally. This will allow you to see changes in real-time as you make them. There
is no need to run a build process or refresh the page manually. Additionally,
you do not need to setup a local server to run the project.

## Testing

To run the tests for the project, run the following command:

```bash
npm test
```
