# Binghamton University Poker Club Website

Repository for the Binghamton University Poker Club's point tracking and tournament management system.
Designed with Next.js and shadcn

## Features

### Club Members
- **View Leaderboard**: Check standings and compare with other members.
- **View Meeting and Tournament Results**: See the where each player earned their points.

### E-Board Members
- **Manage Points**: Update points after tournaments or weekly meetings. Point calculations are done automatically and only need rank/knockout info.
- **Track Tournament Progression**: Create active tournament in which allows eboard members to input knockouts as the happen.

### Admin Panel
![adminPanel](readme-img/edit-options.png)
Everying in the admin panel is blocked behind a password so only authorized people can make adjustments to score.

### Player Autocomplete
![playerAutocomplete](readme-img/player-list.png)

Player names are automatically filled in as you type so you can ensure you are adding the points to the correct players.
Everywhere there is place to enter a name it uses this.
The player list button also give a option to add member to the database, so they become searchable.

### Weekly Meetings Settings
![meetingList](readme-img/meeting-list.png)
![addWeeklyMeeting](readme-img/add-weekly-meeting.png)
![meetingDetails](readme-img/meeting-details.png)
![addWeelkyMeetingResult](readme-img/add-new-meeting-result.png)

### Tournament Settings
![tournamentList](readme-img/tournament-list.png)
![addTournament](readme-img/create-new-tournament.png)
![tournamentDetails](readme-img/tournament-details.png)
![addTournamentResult](readme-img/add-tournament-result.png)

### Tournament Dealers
Tournament Dealers get a special password to be able to enter knockouts as they happen.

![eboardAccess](readme-img/eboard-access.png)
![activeTournaments](readme-img/active-tournaments.png)
![addKnockout](readme-img/add-knockout.png)