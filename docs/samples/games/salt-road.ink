// Salt Road: exported from OpenAct
// One knot per node. GO TO becomes a divert, SET a variable, IF a condition.

VAR knows_about_key = false
VAR knows_boats_lost = false
VAR tam_trusts_player = false

-> harbour_gate

// QUEST BEAT: Reach the lighthouse before the tide turns

=== harbour_gate ===
// Dawn. Fog sits on the water. MARGOT, the harbour keeper, is mending a net and does not look up. Plays when the player first arrives.
MARGOT: You've come down the salt road. Nobody does that any more. #id:MARGOT_001 #delivery:wary
* [I need to reach the lighthouse.]
MARGOT: Then you need the key, and the key is with Tam. #id:MARGOT_002
~ knows_about_key = true
-> net_loft
* [Why is the harbour empty?]
MARGOT: The boats went out after the light went dark. None came back. #id:MARGOT_003 #delivery:quietly
~ knows_boats_lost = true
-> harbour_gate
* [Never mind.]
-> END
// BARK MARGOT_004 MARGOT: Mind the wet planks.
// BARK MARGOT_005 MARGOT: Fog is thicker than it was.
// LORE: The salt road runs along the bar at low water. It is dry for four hours a day, and not one minute more.

=== net_loft ===
// A loft of drying nets. TAM, young and out of breath, hides a brass key behind his back.
TAM: Margot sent you? She always sends someone. They never come back. #id:TAM_001 #delivery:defensive
* {knows_boats_lost} [The boats never came back either. I know.]
TAM: Then you know why I am scared of that light. #id:TAM_002
~ tam_trusts_player = true
-> lighthouse_door
* [Give me the key.]
TAM: Take it. Please. Just take it. #id:TAM_003
-> lighthouse_door
* [I will leave you to it.]
-> harbour_gate
// BARK TAM_004 TAM: Is somebody there?

=== lighthouse_door ===
// The tide is already lapping at the steps. The door is stiff, and the lamp room above is dark.
{tam_trusts_player: TAM: I will hold the door. Go on.} #id:TAM_005
* [Climb to the lamp room.]
-> END
* [Turn back.]
-> net_loft
