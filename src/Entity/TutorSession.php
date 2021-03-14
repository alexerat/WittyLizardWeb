<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorSession
 *
 * @ORM\Table(name="Tutoring.Tutor_Session", uniqueConstraints={@ORM\UniqueConstraint(name="Session_ID_UNIQUE", columns={"Session_ID"})},
 * indexes={@ORM\Index(name="fk_Tutor_Session_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Tutor_Session_Curriculum_Table1_idx", columns={"Curriculum_ID"}), @ORM\Index(name="fk_Tutor_Session_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class TutorSession
{

    /**
     * @var integer
     *
     * @ORM\Column(name="Session_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $sessId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \App\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorialRoomTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \App\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\CurriculumTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    private $currId;

    /**
     * Get sessId
     *
     * @return integer
     */
    public function getSessId()
    {
        return $this->sessId;
    }

    /**
     * Set tutorId
     *
     * @param \App\Entity\UserTable $tutorId
     *
     * @return TutorSession
     */
    public function setTutorId(\App\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \App\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set roomId
     *
     * @param \App\Entity\TutorialRoomTable $roomId
     *
     * @return TutorSession
     */
    public function setRoomId(\App\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \App\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set currId
     *
     * @param \App\Entity\CurriculumTable $currId
     *
     * @return TutorSession
     */
    public function setCurrId(\App\Entity\CurriculumTable $currId = null)
    {
        $this->currId = $currId;

        return $this;
    }

    /**
     * Get currId
     *
     * @return \App\Entity\CurriculumTable
     */
    public function getCurrId()
    {
        return $this->currId;
    }
}
