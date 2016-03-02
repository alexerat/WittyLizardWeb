<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * JoinWait
 *
 * @ORM\Table(name="Online_Comms.Join_Wait_List",
 * indexes={@ORM\Index(name="fk_Join_Wait_List_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Join_Wait_List_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class JoinWait
{

    /**
     * @var \AppBundle\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorialRoomTable", inversedBy="waitingJoins")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     * @ORM\Id
     */
    private $roomId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\UserTable", inversedBy="waitingJoin")
     * @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * @ORM\Id
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Attempt_Time", type="datetime")
    */
    private $joinTime;

    /**
     * Set joinTime
     *
     * @param \DateTime $joinTime
     *
     * @return JoinWait
     */
    public function setJoinTime($joinTime)
    {
        $this->joinTime = $joinTime;

        return $this;
    }

    /**
     * Get joinTime
     *
     * @return \DateTime
     */
    public function getJoinTime()
    {
        return $this->joinTime;
    }

    /**
     * Set roomId
     *
     * @param \AppBundle\Entity\TutorialRoomTable $roomId
     *
     * @return JoinWait
     */
    public function setRoomId(\AppBundle\Entity\TutorialRoomTable $roomId)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \AppBundle\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return JoinWait
     */
    public function setUser(\AppBundle\Entity\UserTable $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
